/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ca1-pnd.edcdn.com',
            },
        ],
    },
};

module.exports = nextConfig;
