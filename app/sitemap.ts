import { MetadataRoute } from 'next'
import GraphQL from './lib/GraphQl'
import grants from '../public/data/grants.json'

const siteUrl = 'https://www.pandemicpact.org'

interface craftEntryProps {
    uri: string, 
    typeHandle: string
    dateUpdated: string
}

interface Grant {
    "GrantID": string
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    
    const craftEntries = await GraphQL(
        `{
			entries(
				status: "enabled",
				uri: ":notempty:"
			) {
                uri
                typeHandle
			}
		}`
    )

    const homepage = await GraphQL(
        `{
            entries(section: "homepage") {
              uri
              dateUpdated
            }
        }`
    )
    
    const typeHandlesToRemove = [
        'homepage',
        'redirect',
        'testPage'
    ]

    const homepageSitemapData = homepage.entries.map((homepage: craftEntryProps) => ({
        // Homepage does not need a uri set in the url field of the sitemap
        url: `${siteUrl}`,
        lastModified: homepage.dateUpdated
    }))
    
    const entriesSitemapData = craftEntries.entries.filter((entry: craftEntryProps) => 
        !typeHandlesToRemove.includes(entry.typeHandle)
    ).map((entry: craftEntryProps) => ({
            url: `${siteUrl}/${entry.uri}`,
            lastModified: entry.dateUpdated
        }
    ))

    const grantPageSitemapData = (grants as Grant[])
        .filter((grant: Grant) => 
            grant["GrantID"] !== undefined
        ).map(({ GrantID }: { GrantID: string }) => ({
            url: `${siteUrl}/grants/${GrantID}`
        }))
    
    return [
        ...homepageSitemapData,
        ...entriesSitemapData,
        ...grantPageSitemapData
    ]
}