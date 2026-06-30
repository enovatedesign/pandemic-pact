import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectsCommand,
    ListObjectsV2Command,
} from '@aws-sdk/client-s3'
import {
    CloudFrontClient,
    CreateInvalidationCommand,
} from '@aws-sdk/client-cloudfront'
import { info, warn } from './log'

// Read env at call time, not module-load time: the generate entry points call
// dotenv.config() inside main(), which runs AFTER imports are evaluated.
let client: S3Client | null = null

export function getS3Client(): S3Client {
    if (!client) {
        client = new S3Client({ region: process.env.AWS_REGION })
    }
    return client
}

function requireBucket(): string {
    const bucket = process.env.S3_BUCKET
    if (!bucket) {
        throw new Error('S3_BUCKET not set, cannot write to S3')
    }
    return bucket
}

/**
 * Public read base (CloudFront) for grant/cache objects, trailing slash trimmed.
 */
export function assetBaseUrl(): string {
    const url = process.env.ASSET_BASE_URL
    if (!url) {
        throw new Error('ASSET_BASE_URL not set, cannot resolve the S3/CloudFront read URL')
    }
    return url.replace(/\/$/, '')
}

const CONTENT_TYPES: Record<string, string> = {
    json: 'application/json',
    csv: 'text/csv',
    gz: 'application/gzip',
}

export function contentTypeForKey(key: string): string {
    const ext = key.split('.').pop()?.toLowerCase() ?? ''
    return CONTENT_TYPES[ext] ?? 'application/octet-stream'
}

export async function s3PutObject(
    key: string,
    body: string | Buffer,
    contentType: string = contentTypeForKey(key),
    cacheControl: string = 'public, max-age=60, s-maxage=3600',
): Promise<void> {
    await getS3Client().send(
        new PutObjectCommand({
            Bucket: requireBucket(),
            Key: key,
            Body: body,
            ContentType: contentType,
            CacheControl: cacheControl,
        }),
    )
}

/**
 * Reads an object directly from S3 (not via the CDN, so it is never stale).
 * Returns null if the object does not exist.
 */
export async function s3GetObjectString(key: string): Promise<string | null> {
    try {
        const res = await getS3Client().send(
            new GetObjectCommand({ Bucket: requireBucket(), Key: key }),
        )
        return (await res.Body?.transformToString()) ?? null
    } catch (e: any) {
        if (e?.name === 'NoSuchKey' || e?.$metadata?.httpStatusCode === 404) {
            return null
        }
        throw e
    }
}

export async function s3ListKeys(prefix: string): Promise<string[]> {
    const bucket = requireBucket()
    const s3 = getS3Client()
    const keys: string[] = []
    let token: string | undefined

    do {
        const res = await s3.send(
            new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: prefix,
                ContinuationToken: token,
                MaxKeys: 1000,
            }),
        )
        for (const obj of res.Contents ?? []) {
            if (obj.Key) keys.push(obj.Key)
        }
        token = res.IsTruncated ? res.NextContinuationToken : undefined
    } while (token)

    return keys
}

export async function s3DeleteObjects(keys: string[]): Promise<void> {
    if (keys.length === 0) return
    const bucket = requireBucket()
    const s3 = getS3Client()

    for (let i = 0; i < keys.length; i += 1000) {
        const batch = keys.slice(i, i + 1000)
        await s3.send(
            new DeleteObjectsCommand({
                Bucket: bucket,
                Delete: { Objects: batch.map(Key => ({ Key })) },
            }),
        )
    }
}

/**
 * Run an async mapper over items with a bounded number of concurrent workers.
 */
export async function mapWithConcurrency<T, R>(
    items: T[],
    limit: number,
    fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
    const results: R[] = new Array(items.length)
    let next = 0

    async function worker() {
        while (true) {
            const i = next++
            if (i >= items.length) return
            results[i] = await fn(items[i], i)
        }
    }

    await Promise.all(
        Array.from({ length: Math.min(limit, items.length) }, () => worker()),
    )

    return results
}

/**
 * Best-effort CloudFront invalidation of the given paths. No-op (with a warning)
 * when CLOUDFRONT_DISTRIBUTION_ID is unset.
 */
export async function invalidateCloudFront(paths: string[]): Promise<void> {
    const distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID

    if (!distributionId) {
        warn('CLOUDFRONT_DISTRIBUTION_ID not set, skipping CloudFront invalidation')
        return
    }

    if (paths.length === 0) return

    const items = paths.map(p => (p.startsWith('/') ? p : `/${p}`))
    const cf = new CloudFrontClient({ region: process.env.AWS_REGION })

    try {
        await cf.send(
            new CreateInvalidationCommand({
                DistributionId: distributionId,
                InvalidationBatch: {
                    CallerReference: `pp-${Date.now()}-${items.length}`,
                    Paths: { Quantity: items.length, Items: items },
                },
            }),
        )
        info(`Requested CloudFront invalidation for ${items.length} path(s)`)
    } catch (e) {
        warn('CloudFront invalidation failed: ' + (e instanceof Error ? e.message : String(e)))
    }
}
