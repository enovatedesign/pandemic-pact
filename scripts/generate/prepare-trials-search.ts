import fs from 'fs-extra'
import _ from 'lodash'
import { title, info, warn } from '../helpers/log'
import {
    getSearchClient,
    getSearchDataset,
    getIndexName,
} from '../../app/api/helpers/search'
import { indexDatasetInOpenSearch } from '../helpers/index-dataset-in-opensearch'
import { DatasetConfig } from '../config/datasets'

/**
 * Cheap check for the cached/skip path: is the CT index already present and
 * non-empty? If so, an unchanged dataset needs no re-indexing. Returns true
 * (needs indexing) on any uncertainty, so we never leave the explore page
 * backed by a missing or empty index.
 */
export async function trialsSearchIndexNeedsPopulating(
    config: DatasetConfig,
): Promise<boolean> {
    if (process.env.SKIP_OPENSEARCH_INDEXING) {
        return false
    }

    const client = getSearchClient()

    if (!client) {
        // OpenSearch not configured — there is nothing to index.
        return false
    }

    const index = getIndexName(config.searchIndexBaseName)

    try {
        const { body: exists } = await client.indices.exists({ index })
        if (!exists) return true

        const { body } = await client.count({ index })
        return (body?.count ?? 0) === 0
    } catch {
        // Be safe: if we can't determine the state, re-index.
        return true
    }
}

/**
 * Indexes the Clinical Research Registrations (ICTRP) dataset into its own
 * OpenSearch index (separate from grants, on the same cluster). Reuses the
 * generic indexer; the only CT-specific parts are the field mapping and the
 * indexed document shape.
 */
export default async function prepareTrialsSearch(config: DatasetConfig) {
    if (process.env.SKIP_OPENSEARCH_INDEXING) {
        warn('Skipping OpenSearch indexing because SKIP_OPENSEARCH_INDEXING env var is present')
        return
    }

    const client = getSearchClient()

    if (!client) {
        info('OpenSearch not configured, skipping trials indexing')
        return
    }

    title('Indexing clinical trials in OpenSearch')

    const dataset = getSearchDataset('clinical-trials')

    const selectOptions = fs.readJsonSync(config.outputPaths.selectOptionsJson)

    // Title fields are full-text searchable; everything else (the filterable
    // select-option fields plus the registration year) is keyword.
    const mappingProperties = {
        TrialID: { type: 'keyword' },
        TrialNumber: { type: 'keyword' },
        TrialTitle: { type: 'text' },
        TrialTitleScientific: { type: 'text' },
        TrialTitlePublic: { type: 'text' },
        Register: { type: 'keyword' },
        SourceLink: { type: 'keyword' },
        RegistrationYear: { type: 'keyword' },

        // Precomputed co-located flags. Per the Technical Specification §6.1
        // ("Location vs Institution — no fallback logic, treat independently"),
        // research location and research institution are kept as two separate
        // flags rather than a single combined one: a trial is co-located by
        // location when it spans more than one research-location country, and
        // co-located by institution when it spans more than one research-
        // institution country. Backs the two Explore "Co-located" filters and the
        // Viz 1 "Explore Co-located" deep-link (which targets the flag matching
        // the map's active source).
        CoLocatedByLocation: { type: 'boolean' },
        CoLocatedByInstitution: { type: 'boolean' },

        // A keyword field for every select option (filterable values + labels live
        // in select-options.json, the index just needs the codes for term filters).
        ...Object.fromEntries(
            Object.keys(selectOptions).map(field => [field, { type: 'keyword' }]),
        ),
    }

    await indexDatasetInOpenSearch({
        client,
        dataset,
        gzippedRecordsPath: config.outputPaths.distGz,
        mappingProperties,
        buildDoc: (trial: any) => ({
            ..._.pick(trial, Object.keys(mappingProperties)),
            CoLocatedByLocation:
                (trial.ResearchLocationCountry?.length ?? 0) > 1,
            CoLocatedByInstitution:
                (trial.ResearchInstitutionCountry?.length ?? 0) > 1,
        }),
    })
}
