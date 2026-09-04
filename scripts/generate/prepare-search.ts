import fs from 'fs-extra'
import _ from 'lodash'
import { title, info, warn } from '../helpers/log'
import { getSearchClient, getSearchDataset } from '../../app/api/helpers/search'
import { indexDatasetInOpenSearch } from '../helpers/index-dataset-in-opensearch'
import { splitGrantIds } from '../../app/helpers/pubmed-ids'

export default async function prepareSearch(
    publicationCounts?: Record<string, number>,
    changedIds?: string[],
) {
    if (process.env.SKIP_OPENSEARCH_INDEXING === 'true') {
        warn('Skipping OpenSearch indexing because SKIP_OPENSEARCH_INDEXING is true')
        return
    }

    const client = getSearchClient()

    if (!client) {
        info('OpenSearch not configured, skipping indexing')
        return
    }

    title('Indexing data in OpenSearch')

    const dataset = getSearchDataset('grants')

    const selectOptions = fs.readJsonSync('./data/dist/select-options.json')

    // Define explicit types for each field in the index.
    // Keyword fields are typically used for filters, whereas
    // text fields are used for fuzzy text searches.
    const mappingProperties = {
        GrantID: { type: 'keyword' },
        GrantTitleEng: { type: 'text' },
        Abstract: { type: 'text' },
        LaySummary: { type: 'text' },
        GrantAmountConverted: { type: 'long' },
        JointFunding: { type: 'boolean' },
        PublicationCount: { type: 'long' },

        // Prepare a keyword type field for each select option
        ...Object.fromEntries(
            Object.keys(selectOptions).map(field => [
                field,
                { type: 'keyword' },
            ]),
        ),
    }

    await indexDatasetInOpenSearch({
        client,
        dataset,
        gzippedRecordsPath: './data/dist/grants.json.gz',
        // When a changed-id set is provided, only (re)upsert those grants.
        // Removed grants are still pruned against the full data set inside the
        // helper. An undefined set means reindex everything (full reindex).
        changedIds,
        mappingProperties,
        buildDoc: (grant: any) => {
            // Get an object with only the fields we want to index
            const doc = _.pick(grant, Object.keys(mappingProperties))

            const docBody: any = {
                ...doc,
                // Add a flag to indicate if there is more than
                // one funder country for filtering purposes on the
                // frontend
                JointFunding: doc.FunderCountry.length > 1,
            }

            // Only set the publication count when counts were provided. Deploy
            // builds no longer fetch PubMed and call prepareSearch() with no
            // counts; omitting the field means doc_as_upsert leaves any existing
            // PublicationCount untouched rather than zeroing it. The weekly
            // PubMed job passes counts and refreshes the field.
            if (publicationCounts !== undefined) {
                docBody.PublicationCount = getPublicationCount(
                    publicationCounts,
                    grant.PubMedGrantId as string,
                )
            }

            return docBody
        },
    })

    // Review deploys are triggered by Gitlab CI and are provided with a SEARCH_INDEX_PREFIX
    // that way, which means that they aren't stored at Vercel. Therefore we need to inject
    // the SEARCH_INDEX_PREFIX environment variable into the .env file so that the NextJS
    // API routes can access it.
    if (process.env.CI && process.env.SEARCH_INDEX_PREFIX) {
        const searchIndexPrefix = process.env.SEARCH_INDEX_PREFIX

        fs.appendFileSync('.env', `\nSEARCH_INDEX_PREFIX=${searchIndexPrefix}`)

        info(`Wrote SEARCH_INDEX_PREFIX ${searchIndexPrefix} to .env`)
    }
}

/**
 * Look up publication count for a grant, handling multi-ID PubMedGrantIds
 * (comma/semicolon/double-space separated) by splitting and summing.
 */
function getPublicationCount(
    counts: Record<string, number> | undefined,
    pubMedGrantId: string,
): number {
    if (!counts || !pubMedGrantId) return 0

    // Fast path: direct lookup for single-ID grants
    if (counts[pubMedGrantId] !== undefined) return counts[pubMedGrantId]

    // Split and sum for multi-ID grants
    const parts = splitGrantIds(pubMedGrantId)
    return parts.reduce((sum, part) => sum + (counts[part] ?? 0), 0)
}
