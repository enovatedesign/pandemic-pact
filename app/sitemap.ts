import { MetadataRoute } from 'next'
import GraphQL from './lib/GraphQl'

// Bundled at build time so the sitemap never reads from the filesystem at
// runtime. Files under public/ are served by the CDN but are NOT included in
// the serverless function bundle, so the previous fs.readFile() of this file
// threw ENOENT and returned HTTP 500 (which Search Console reported as
// "Sitemap could not be read — General HTTP error").
import grantIds from '@/public/data/grant-ids.json'

const siteUrl = 'https://www.pandemicpact.org'

// Statically generate /sitemap.xml at build and refresh it daily via ISR. New
// CMS entries are picked up on revalidation; grant IDs are bundled at build and
// only change on deploy (when the data is regenerated).
export const revalidate = 86400

// NOTE: a single Next.js sitemap is limited to 50,000 URLs. We currently emit
// ~30k (grants + CMS pages). If that approaches the limit, split into a sitemap
// index with generateSitemaps() — note that changes the public URLs to
// /sitemap/<id>.xml and requires resubmitting them in Search Console.

interface craftEntryProps {
    uri: string,
    typeHandle: string
    dateUpdated: string
}

const typeHandlesToRemove = [
    'homepage',
    'redirect',
    'testPage',
]

/**
 * Fetch CMS-managed URLs (homepage + Craft entries). Returns an empty list if
 * the CMS is unavailable, so a transient Craft outage degrades to a
 * grants-only sitemap instead of failing the whole route.
 */
async function getCmsSitemapEntries(): Promise<MetadataRoute.Sitemap> {
    try {
        const [craftEntries, homepage] = await Promise.all([
            GraphQL(
                `{
                    entries(
                        status: "enabled",
                        uri: ":notempty:"
                    ) {
                        uri
                        typeHandle
                    }
                }`,
                {},
                undefined,
                { revalidate },
            ),
            GraphQL(
                `{
                    entries(section: "homepage") {
                        uri
                        dateUpdated
                    }
                }`,
                {},
                undefined,
                { revalidate },
            ),
        ])

        const homepageSitemapData = (homepage?.entries ?? []).map((homepage: craftEntryProps) => ({
            // Homepage does not need a uri set in the url field of the sitemap
            url: `${siteUrl}`,
            lastModified: homepage.dateUpdated,
        }))

        const entriesSitemapData = (craftEntries?.entries ?? [])
            .filter((entry: craftEntryProps) => !typeHandlesToRemove.includes(entry.typeHandle))
            .map((entry: craftEntryProps) => ({
                url: `${siteUrl}/${entry.uri}`,
                lastModified: entry.dateUpdated,
            }))

        return [...homepageSitemapData, ...entriesSitemapData]
    } catch (error) {
        console.error('sitemap: failed to load CMS entries, serving grants only', error)
        return []
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const cmsSitemapData = await getCmsSitemapEntries()

    const grantPageSitemapData = (grantIds as string[]).map(id => ({
        url: `${siteUrl}/grants/${id}`,
    }))

    return [
        ...cmsSitemapData,
        ...grantPageSitemapData,
    ]
}
