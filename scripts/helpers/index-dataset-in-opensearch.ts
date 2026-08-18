import _ from 'lodash'
import zlib from 'zlib'
import fs from 'fs-extra'
import { execSync } from 'child_process'
import { info, error } from './log'
import {
    getIndexName,
    fetchAllIdsInIndex,
    SearchDatasetConfig,
} from '../../app/api/helpers/search'
import type { Client } from '@opensearch-project/opensearch'

/**
 * Run an OpenSearch bulk request and fail loudly on any error.
 *
 * A bulk request can fail two ways: the call itself rejects (network/auth), or
 * it resolves with `errors: true` because individual items failed (mapping
 * conflicts, rate limiting, malformed docs). Both leave the index incomplete,
 * so we surface the first item error rather than letting the build report
 * success against a partially-indexed dataset.
 */
async function runBulk(
    client: Client,
    operation: string,
    body: any[],
): Promise<void> {
    const { body: response } = await client.bulk({ body })

    if (response.errors) {
        const firstFailed = (response.items ?? []).find((item: any) => {
            const result = Object.values(item)[0] as any
            return result?.error
        })

        const reason = firstFailed
            ? JSON.stringify((Object.values(firstFailed)[0] as any).error)
            : 'unknown error'

        throw new Error(
            `Bulk ${operation} reported item errors; the index is incomplete. First error: ${reason}`,
        )
    }
}

/**
 * Generic OpenSearch bulk-indexer shared by both datasets.
 *
 * Reads a gzipped records file, creates the index (with the given mapping) if it
 * doesn't exist, bulk-upserts every record keyed on the dataset's id field, then
 * removes any documents that are no longer present in the source data. The only
 * dataset-specific parts — which fields are mapped and how each document is shaped
 * for indexing — are supplied by the caller via `mappingProperties` and `buildDoc`.
 */
export async function indexDatasetInOpenSearch({
    client,
    dataset,
    gzippedRecordsPath,
    mappingProperties,
    buildDoc,
    changedIds,
}: {
    client: Client
    dataset: SearchDatasetConfig
    gzippedRecordsPath: string
    mappingProperties: Record<string, { type: string }>
    /** Map a raw record to the document indexed in OpenSearch. */
    buildDoc: (record: any) => Record<string, any>
    /**
     * When provided, only records whose id is in this set are (re)upserted —
     * an incremental index that skips re-writing unchanged documents. Removed
     * records are still pruned against the full data set below. An undefined
     * set means reindex everything (full reindex).
     */
    changedIds?: string[]
}) {
    const indexName = getIndexName(dataset.indexBaseName)
    const idField = dataset.idField

    const { body: updatingExistingIndex } = await client.indices.exists({
        index: indexName,
    })

    if (updatingExistingIndex) {
        info(`Index ${indexName} already exists, skipping creation`)
    } else {
        info(`Creating index ${indexName}...`)

        await client.indices
            .create({
                index: indexName,
                body: {
                    mappings: {
                        properties: mappingProperties,
                    },
                },
            })
            .catch(e => {
                error(`Error creating index ${indexName}: ${e}`)
            })

        info(`Created index ${indexName}`)
    }

    info(`Bulk indexing ${indexName} with upserts...`)

    const gzipBuffer = fs.readFileSync(gzippedRecordsPath)
    const jsonBuffer = zlib.gunzipSync(gzipBuffer as any)
    const allRecords: any[] = JSON.parse(jsonBuffer.toString())

    // When a changed-id set is provided, only (re)upsert those records. The
    // prune step below still works against the full data set, so removed
    // records are deleted regardless. An undefined set means reindex everything.
    const recordsToIndex =
        changedIds === undefined
            ? allRecords
            : (() => {
                  const changedSet = new Set(changedIds)
                  return allRecords.filter((record: any) =>
                      changedSet.has(record[idField]),
                  )
              })()

    if (changedIds !== undefined) {
        info(
            `Incremental index: upserting ${recordsToIndex.length} changed record(s)`,
        )
    }

    const chunkSize = 500

    const chunkedRecords = _.chunk(recordsToIndex, chunkSize)

    for (let i = 0; i < chunkedRecords.length; i++) {
        if (i > 0) {
            info(`Indexed ${i * chunkSize}/${recordsToIndex.length} documents`)
        }

        const records = chunkedRecords[i]

        const bulkOperations: any[] = records
            .map((record: any) => [
                {
                    update: {
                        _index: indexName,
                        _id: record[idField],
                    },
                },
                {
                    doc: buildDoc(record),
                    doc_as_upsert: true,
                },
            ])
            .flat()

        await runBulk(client, 'upsert', bulkOperations)

        // Sleep for a second to avoid rate limiting
        execSync('sleep 1')
    }

    info(`Bulk Indexed ${indexName} with upserts`)

    // If the index already existed, remove any documents that are no longer in
    // the source data.
    if (updatingExistingIndex) {
        const allIdsInIndex = await fetchAllIdsInIndex(client, dataset)

        const idsInData = allRecords.map((record: any) => record[idField])

        const idsToDelete = _.difference(allIdsInIndex, idsInData)

        if (idsToDelete.length > 0) {
            info(`Removing documents that are no longer in the data...`)

            const chunkedIdsToDelete = _.chunk(idsToDelete, chunkSize)

            for (let i = 0; i < chunkedIdsToDelete.length; i++) {
                if (i > 0) {
                    info(
                        `Deleted ${i * chunkSize}/${idsToDelete.length} documents`,
                    )
                }

                const ids = chunkedIdsToDelete[i]

                const bulkOperations: any[] = ids.map((id: string) => ({
                    delete: {
                        _index: indexName,
                        _id: id,
                    },
                }))

                await runBulk(client, 'delete', bulkOperations)

                // Sleep for a second to avoid rate limiting
                execSync('sleep 1')
            }

            info(
                `Removed ${idsToDelete.length} documents that are no longer in the data`,
            )
        }
    }
}
