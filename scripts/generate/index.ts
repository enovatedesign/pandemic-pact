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

main()

async function main() {
    dotenv.config({ path: './.env.local' })

    await downloadAndParseDataSheets()

    await prepareGrants()
    
    prepareSelectOptions()

    prepareHomepageTotals()

    await fetchPubMedData()

    prepareIndividualGrantFiles()

    prepareVisualisePageGrantsFile()

    prepareCsvExportFile()

    prepareMap()
    
    await prepare100DaysMission()
    
    await prepare100DaysMissionSelectOptions()
    
    await preparePolicyRoadmapSelectOptions()

    await prepareSearch()

    await prepareGrantIdsForSitemap()
}
