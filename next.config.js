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
