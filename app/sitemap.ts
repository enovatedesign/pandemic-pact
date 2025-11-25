import { MetadataRoute } from 'next'
import fs from 'fs-extra'
import GraphQL from './lib/GraphQl'
import path from 'path'

const siteUrl = 'https://www.pandemicpact.org'

interface craftEntryProps {
    uri: string, 
    typeHandle: string
    dateUpdated: string
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const grantDataPath = path.join(process.cwd(), 'public/data/grant-ids.json')
    const grantData = await fs.readFile(grantDataPath, 'utf8')
    const grantIds: string[] = JSON.parse(grantData)
    
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

    const grantPageSitemapData = grantIds.map(id => ({
        url: `${siteUrl}/grants/${id}`
    }))
    
    return [
        ...homepageSitemapData,
        ...entriesSitemapData,
        ...grantPageSitemapData
    ]
}