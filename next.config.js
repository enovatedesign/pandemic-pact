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
        if (process.env.USE_BLOB_STORAGE === 'true' && process.env.BLOB_BASE_URL) {
            const branch = process.env.VERCEL_GIT_COMMIT_REF || process.env.CI_COMMIT_REF_NAME || 'master'
            const branchName = branch
                .replace(/^refs\/heads\//, '')
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, '-')
                .slice(0, 63)
            return [
                {
                    source: '/grants/:id.json',
                    destination: `${process.env.BLOB_BASE_URL}/${branchName}/grants/:id.json`,
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
        ];
    },
};

module.exports = nextConfig;
