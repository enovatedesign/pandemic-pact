import { MetadataRoute } from 'next'
import GraphQL from './lib/GraphQl'
import fs from 'fs';
import path from 'path';

const siteUrl = 'https://www.pandemicpact.org'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    
    const craftPages = await GraphQL(
        `{
            entries(section: "pages") {
              uri
              dateUpdated
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

    interface craftPageProps {
        uri: string, 
        dateUpdated: string
    }
    
    const homepageSitemapData = homepage.entries.map((homepage: craftPageProps) => ({
        // Homepage does not need a uri set in the url field of the sitemap
        url: `${siteUrl}`,
        lastModified: homepage.dateUpdated
    }))
    
    const entriesSitemapData = craftPages.entries.map((entry: craftPageProps) => ({
        url: `${siteUrl}/${entry.uri}`,
        lastModified: entry.dateUpdated
    }))

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

    const grantPageSitemapData = grantJsonDataArray.map((grant: {GrantID: string, updated_at: string}) => ({
        url: `${siteUrl}/grants/${grant.GrantID}`, 
    }))
    return [
        ...homepageSitemapData,
        ...entriesSitemapData,
        ...grantPageSitemapData
    ]
}