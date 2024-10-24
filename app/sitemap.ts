import { MetadataRoute } from 'next'
import GraphQL from './lib/GraphQl'
import fs from 'fs';
import path from 'path';

const siteUrl = 'https://www.pandemicpact.org'

interface craftEntryProps {
    uri: string, 
    typeHandle: string
    dateUpdated: string
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

    const grantDirectory = path.join(process.cwd(), 'data', 'dist', 'grants');
    
    const readJsonFiles = async () => {
        try {
            const grantFileNames = fs.readdirSync(grantDirectory);
        
            const grantData = [];
        
            for (const grantFileName of grantFileNames) {
                const grantFilepath = path.join(grantDirectory, grantFileName);
                const grantContent = fs.readFileSync(grantFilepath, 'utf-8');
                const grantJsonData = JSON.parse(grantContent);
                grantData.push(grantJsonData);
            }
        
            return grantData;
        } catch (error) {
            console.error('Error reading JSON files:', error);
            return [];
        }
    };

    const grantJsonDataArray = await readJsonFiles();

    const grantPageSitemapData = grantJsonDataArray
        .filter(({GrantID}) => 
            GrantID !== undefined
        ).map(({ GrantID }: { GrantID: string }) => ({
            url: `${siteUrl}/grants/${GrantID}`
        }))
    
    return [
        ...homepageSitemapData,
        ...entriesSitemapData,
        ...grantPageSitemapData
    ]
}