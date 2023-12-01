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
    async rewrites() {
        // Attempted to use an env var for the destination below,
        // but using string concatenation or template literals seems to break the rewrite :-(
        // The regex below should be able to handle the following URLs:
        // - sitemaps-1-section-propertiesSales-1-sitemap.xml
        // - sitemaps-1-section-propertiesSales-1-sitemap.xsl
        // - sitemap.xml
        // - sitemap.xsl
        // - sitemap-empty.xsl
        // See: https://regex101.com/r/8QUKgO/1
        return [
            {
                source: '/:path([^\/]*sitemap*\.x[ms]l$)',
                destination: 'https://content.pandemicpact.org/:path',
            }
        ]
    },
};

module.exports = nextConfig;
