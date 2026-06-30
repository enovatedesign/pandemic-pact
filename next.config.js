/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        dangerouslyAllowSVG: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ca1-pnd.edcdn.com',
            },
        ],
    },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: false,
    },
    env: {
        // Expose branch name at runtime for blob storage paths
        NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF,
        NEXT_PUBLIC_CI_COMMIT_REF_NAME: process.env.CI_COMMIT_REF_NAME,
    },
    async rewrites() {
        // Read base for the public /grants/:id.json API: S3/CloudFront when
        // STORAGE_BACKEND=s3, otherwise Vercel Blob.
        const assetBaseUrl = process.env.STORAGE_BACKEND === 's3'
            ? process.env.ASSET_BASE_URL
            : process.env.BLOB_BASE_URL

        if (process.env.USE_BLOB_STORAGE === 'true' && assetBaseUrl) {
            const branch = process.env.VERCEL_GIT_COMMIT_REF || process.env.CI_COMMIT_REF_NAME || 'master'
            const branchName = branch
                .replace(/^refs\/heads\//, '')
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, '-')
                .slice(0, 63)
            return [
                {
                    source: '/grants/:id.json',
                    destination: `${assetBaseUrl}/${branchName}/grants/:id.json`,
                },
            ]
        }
        return []
    },
    async redirects() {
        return [
            {
                source: '/publications',
                destination: '/outputs/publications',
                permanent: true
            },
            {
                source: '/publications/:slug',
                destination: '/outputs/publications/:slug',
                permanent: true,
            },
            {
                source: '/visualise',
                destination: '/grants/visualise',
                permanent: true,
            },
            {
                source: '/visualise/policy-roadmaps/:path*',
                destination: '/grants/visualise/policy-roadmaps/:path*',
                permanent: true,
            },
            {
                source: '/grants',
                destination: '/grants/explore',
                permanent: true,
            },
        ];
    },
};

module.exports = nextConfig;
