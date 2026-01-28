import dotenv from 'dotenv'
import downloadAndParseDataSheets from './download-and-parse-data-sheets'
import prepareGrants from './prepare-grants'
import prepareSelectOptions from './prepare-select-options'
import prepareHomepageTotals from './prepare-homepage-totals'
import fetchPubMedData from './fetch-pub-med-data'
import prepareIndividualGrantFiles from './prepare-individual-grant-files'
import prepareVisualisePageGrantsFile from './prepare-visualise-page-grants-file'
import prepareCsvExportFile from './prepare-csv-export-file'
import prepareMap from './prepare-map'
import prepareSearch from './prepare-search'
import prepare100DaysMission from './prepare-100-days-mission'
import prepare100DaysMissionSelectOptions from './prepare-100-days-mission-select-options'
import preparePolicyRoadmapSelectOptions from './prepare-policy-roadmap-select-options'
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
    
    // If we're using cached files, skip all processing
    // OpenSearch will be skipped if SKIP_OPENSEARCH_INDEXING is set
    if (useCachedFiles) {
        info('Using cached static files - skipping grant processing and file generation')
        info('Build complete using cached files')
        return
    }
    
    await prepareGrants()
    
    prepareSelectOptions()

    prepareHomepageTotals()

    await fetchPubMedData()

    const grantIds = await prepareIndividualGrantFiles(shouldUploadConditionsMet)

    // Verify blob upload if it was performed
    if (shouldUploadConditionsMet && grantIds && grantIds.length > 0) {
        const stringGrantIds = grantIds.flat().map(id => String(id)).filter(id => typeof id === 'string');
        await verifyBlobGrants(stringGrantIds)
    }

    prepareVisualisePageGrantsFile()

    prepareCsvExportFile()

    prepareMap()
    
    await prepare100DaysMission()
    
    await prepare100DaysMissionSelectOptions()
    
    await preparePolicyRoadmapSelectOptions()

    await prepareSearch()

    await prepareGrantIdsForSitemap()
    
    // Upload static files to blob for caching if grants were processed
    if (shouldUploadConditionsMet) {
        await uploadStaticFilesToBlob()
    }
}
