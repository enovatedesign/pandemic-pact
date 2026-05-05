import dotenv from 'dotenv'
import fs from 'fs-extra'
import chalk from 'chalk'

import {
    getIndexName,
    getSearchClient,
} from '../app/api/helpers/search'
import { title, info, warn, error } from './helpers/log'

// Mirror of allowedFilterFields in app/api/helpers/search.ts. Kept in
// sync manually because that file does not export the set.
const FILTER_FIELDS = [
    'FundingOrgName',
    'Families',
    'Pathogens',
    'Diseases',
    'Strains',
    'ResearchCat',
    'FunderRegion',
    'FunderCountry',
    'ResearchInstitutionName',
    'ResearchLocationCountry',
    'GrantStartYear',
    'StudySubject',
    'StudyType',
    'AgeGroups',
    'VulnerablePopulations',
    'OccupationalGroups',
    'HundredDaysMissionResearchArea',
    'HundredDaysMissionImplementation',
    'ClinicalTrial',
    'PandemicIntelligenceThemes',
    'PolicyRoadmaps',
    'GrantID',
]

main()

async function main() {
    dotenv.config({ path: './.env.local' })

    const client = getSearchClient()

    if (!client) {
        error('OpenSearch is not configured. Set SEARCH_HOST, SEARCH_USERNAME and SEARCH_PASSWORD in your environment.')
        process.exit(1)
    }

    const indexName = getIndexName()

    title(`Inspecting OpenSearch mapping for index "${indexName}"`)

    const { body: existsBody } = await client.indices.exists({ index: indexName })
    if (!existsBody) {
        error(`Index "${indexName}" does not exist on the configured OpenSearch host.`)
        process.exit(2)
    }

    const { body: mappingBody } = await client.indices.getMapping({ index: indexName })

    // The response is keyed by the resolved index name (which may include
    // the alias if applicable). Take the first key.
    const resolvedIndexName = Object.keys(mappingBody)[0]
    const properties = mappingBody[resolvedIndexName]?.mappings?.properties ?? {}

    // The set of fields we expect to exist as keyword in the index. The
    // union of select-options keys and the explicit filter fields covers
    // everything the API ever emits a term query against.
    const selectOptions = fs.readJsonSync('./data/dist/select-options.json')
    const expectedFields = Array.from(
        new Set([...Object.keys(selectOptions), ...FILTER_FIELDS])
    ).sort()

    let okCount = 0
    let needsKeywordCount = 0
    let missingCount = 0

    info(`${'Field'.padEnd(40)}  ${'Type'.padEnd(8)}  Verdict`)
    info(`${'-'.repeat(40)}  ${'-'.repeat(8)}  ${'-'.repeat(40)}`)

    for (const field of expectedFields) {
        const property = properties[field]
        const isFilterField = FILTER_FIELDS.includes(field)

        if (!property) {
            const label = isFilterField ? chalk.red('MISSING (filter field)') : chalk.gray('missing (not used as filter)')
            info(`${field.padEnd(40)}  ${'-'.padEnd(8)}  ${label}`)
            if (isFilterField) missingCount++
            continue
        }

        const type = property.type ?? 'unknown'
        const hasKeywordSubField = !!property.fields?.keyword

        if (type === 'keyword') {
            info(`${field.padEnd(40)}  ${type.padEnd(8)}  ${chalk.green('OK')}`)
            okCount++
        } else if (type === 'text' && hasKeywordSubField) {
            const label = isFilterField
                ? chalk.yellow('NEEDS .keyword (text + .keyword sub-field; -99 etc. broken via term query)')
                : chalk.gray('text + .keyword (not used as filter)')
            info(`${field.padEnd(40)}  ${type.padEnd(8)}  ${label}`)
            if (isFilterField) needsKeywordCount++
        } else {
            const label = isFilterField
                ? chalk.red(`UNEXPECTED type "${type}"`)
                : chalk.gray(`type "${type}" (not used as filter)`)
            info(`${field.padEnd(40)}  ${type.padEnd(8)}  ${label}`)
            if (isFilterField) needsKeywordCount++
        }
    }

    info('')
    info(`Filter fields OK: ${okCount}`)
    if (needsKeywordCount > 0) warn(`Filter fields needing .keyword fix or wrong type: ${needsKeywordCount}`)
    if (missingCount > 0) warn(`Filter fields missing from index: ${missingCount}`)

    if (needsKeywordCount > 0 || missingCount > 0) {
        error('\nIndex mapping is not clean. Build a new versioned index by setting SEARCH_INDEX_VERSION and re-running the indexer.')
        process.exit(3)
    }

    info(chalk.green('\nAll filter fields are pure keyword. Index mapping is clean.'))
}
