import dotenv from 'dotenv'
import downloadAndParseDataSheets from './download-and-parse-data-sheets'
import prepareGrants from './prepare-grants'
import prepareSelectOptions from './prepare-select-options'
import prepareHomepageTotals from './prepare-homepage-totals'
import fetchPubMedData, { CACHED_BUILD_TIMEOUT_MS } from './fetch-pub-med-data'
import prepareIndividualGrantFiles from './prepare-individual-grant-files'
import prepareVisualisePageGrantsFile from './prepare-visualise-page-grants-file'
import prepareCsvExportFile from './prepare-csv-export-file'
import prepareMap from './prepare-map'
import prepareSearch from './prepare-search'
import prepare100DaysMission from './prepare-100-days-mission'
import prepare100DaysMissionSelectOptions from './prepare-100-days-mission-select-options'
import preparePolicyRoadmapSelectOptions from './prepare-policy-roadmap-select-options'
import preparePandemicIntelligence from './prepare-pandemic-inteligence'
import preparePandemicIntelligenceSelectOptions from './prepare-pandemic-intelligence-select-options'
import prepareGrantIdsForSitemap from './prepare-grant-ids-for-sitemap'
import { verifyBlobGrants } from '../helpers/verify-blob-grants'
import { uploadStaticFilesToBlob } from '../helpers/upload-static-files-to-blob'
import { info } from '../helpers/log'

main()

async function main() {
    dotenv.config({ path: './.env.local' })

    // Determine if we should upload to blob storage
    const isVercelBuild = process.env.VERCEL === '1'
    const forceUpload = process.env.FORCE_BLOB_UPLOAD === 'true'
    const shouldUploadConditionsMet = isVercelBuild || forceUpload

    const { useCachedFiles } = await downloadAndParseDataSheets()
    
    // If we're using cached files, skip all processing.
    // The source JSON data is already downloaded from blob storage.
    if (useCachedFiles) {
        info('Using cached static files - skipping grant processing and file generation')

        // PubMed data is independent of FigShare — always fetch it.
        // grants.json.gz is already downloaded from blob storage.
        // PubMed has its own 7-day caching and will skip API calls when fresh.
        // Individual PubMed files are uploaded to blob during the fetch.
        const publicationCounts = await fetchPubMedData({ timeoutMs: CACHED_BUILD_TIMEOUT_MS })

        await prepareSearch(publicationCounts)
    } else {
        await prepareGrants()

        prepareSelectOptions()

        prepareHomepageTotals()

        const publicationCounts = await fetchPubMedData()

        const grantIds = await prepareIndividualGrantFiles(shouldUploadConditionsMet)

        // Verify blob upload if it was performed
        if (shouldUploadConditionsMet && grantIds && grantIds.length > 0) {
            const stringGrantIds = grantIds.flat().map(id => String(id)).filter(id => typeof id === 'string');
            await verifyBlobGrants(stringGrantIds)
        }

        prepareVisualisePageGrantsFile()

        prepareMap()

        await prepare100DaysMission()

        await prepare100DaysMissionSelectOptions()

        await preparePandemicIntelligence()

        await preparePandemicIntelligenceSelectOptions()

        // Select options for the policy road maps dropdown on the explore page
        await preparePolicyRoadmapSelectOptions()

        await prepareSearch(publicationCounts)

        await prepareGrantIdsForSitemap()

        // Upload static files to blob for caching if grants were processed
        if (shouldUploadConditionsMet) {
            await uploadStaticFilesToBlob()
        }
    }

    // CSV exports — always run, paths are the same regardless of cached/non-cached
    const csvExports = [
        {
            logTitle: 'Preparing CSV export file',
            dataFilePath: './data/dist/grants.json.gz',
            workbookTitle: 'Pandemic PACT Grants',
            exportPath: './public/export/grants',
            dataFileName: 'pandemic-pact-grants.csv',
        },
        {
            logTitle: 'Preparing 100 Days Mission CSV export file',
            dataFilePath: './public/data/100-days-mission/grants.json',
            workbookTitle: '100 Days Mission Grants',
            exportPath: './public/export/100-days-mission',
            dataFileName: '100-days-mission-grants.csv',
        },
        {
            logTitle: 'Preparing Pandemic Intelligence CSV export file',
            dataFilePath: './public/data/pandemic-intelligence/grants.json',
            workbookTitle: 'Pandemic Intelligence Grants',
            exportPath: './public/export/pandemic-intelligence',
            dataFileName: 'pandemic-intelligence-grants.csv',
        },
    ]

    csvExports.forEach(prepareCsvExportFile)
}
