/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        dangerouslyAllowSVG: true,
        // Next 16 raised the default from 60s to 4 hours. Pinned to the old value to
        // keep the upgrade behaviour-neutral: CMS images are replaced at the same URL,
        // so a 4-hour floor would leave a swapped image stale on the page for hours.
        // Raising it is a cost/freshness trade worth making deliberately, not as a
        // side effect of the framework bump.
        minimumCacheTTL: 60,
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
        // Expose branch name at runtime for remote storage paths
        NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF,
        NEXT_PUBLIC_CI_COMMIT_REF_NAME: process.env.CI_COMMIT_REF_NAME,
    },
    async rewrites() {
        // Read base for the public /grants/:id.json API: S3/CloudFront.
        const assetBaseUrl = process.env.ASSET_BASE_URL

        if (process.env.USE_REMOTE_STORAGE === 'true' && assetBaseUrl) {
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
                {
                    source: '/clinical-trials/:id.json',
                    destination: `${assetBaseUrl}/${branchName}/clinical-trials/:id.json`,
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
