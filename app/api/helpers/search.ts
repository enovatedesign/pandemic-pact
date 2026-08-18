import { NextResponse } from 'next/server'
import { Client } from '@opensearch-project/opensearch'
import { jointFundingFilterOptions, SearchFilters } from '../../helpers/search'
import { coLocatedFilterOptions } from '../../clinical-trials/explore/search'
import { normaliseBranchName } from '../../helpers/normalise-branch-name'

/**
 * Per-dataset search configuration. Both datasets share one OpenSearch cluster but
 * live in separate indices, search different text fields, allow different filter
 * fields and surface different `_source` fields. Keeping these differences in a
 * declarative config (rather than `if (dataset === 'grants')` branches scattered
 * through the routes) mirrors the pipeline-side DatasetConfig approach.
 */
export interface SearchDatasetConfig {
    /** Stable dataset key (also the route segment, e.g. /api/search/<key>/list). */
    key: 'grants' | 'clinical-trials'
    /** Base name for the OpenSearch index (prefix/version are applied at runtime). */
    indexBaseName: string
    /** The document's unique id field (used as the OpenSearch _id and sort key). */
    idField: string
    /** Full-text fields (with `^boost`) searched by the free-text query. */
    fullTextFields: string[]
    /** Fields a user is permitted to filter on. */
    allowedFilterFields: Set<string>
    /** Fields highlighted in search hits. */
    highlightFields: string[]
    /** `_source` fields returned for the results list. */
    listSourceFields: string[]
    /** `_source` fields returned for the single-hit (highlight) lookup. */
    showSourceFields: string[]
    /** Whether the grants-only joint-funding constraint applies. */
    supportsJointFunding: boolean
    /** Whether the clinical-trials-only co-located constraint applies. */
    supportsCoLocated: boolean
}

const grantsSearchDataset: SearchDatasetConfig = {
    key: 'grants',
    indexBaseName: 'grants',
    idField: 'GrantID',
    fullTextFields: ['GrantID^4', 'GrantTitleEng^4', 'Abstract^2', 'LaySummary'],
    allowedFilterFields: new Set([
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
    ]),
    highlightFields: ['GrantTitleEng', 'Abstract', 'LaySummary'],
    listSourceFields: [
        'GrantTitleEng',
        'Abstract',
        'LaySummary',
        'GrantAmountConverted',
        'GrantStartYear',
        'FundingOrgName',
        'PublicationCount',
        'JointFundedGrants',
        'PolicyRoadmaps',
    ],
    showSourceFields: ['GrantTitleEng', 'Abstract', 'LaySummary'],
    supportsJointFunding: true,
    supportsCoLocated: false,
}

const clinicalTrialsSearchDataset: SearchDatasetConfig = {
    key: 'clinical-trials',
    indexBaseName: 'clinical-trials',
    idField: 'TrialID',
    fullTextFields: [
        'TrialID^4',
        'TrialNumber^4',
        'TrialTitle^4',
        'TrialTitleScientific^2',
        'TrialTitlePublic^2',
    ],
    allowedFilterFields: new Set([
        'Families',
        'Pathogens',
        'Diseases',
        'Strains',
        'Register',
        'Interventions',
        'MainIntervention',
        'SecondaryIntervention',
        'ResearchInstitutionRegion',
        'ResearchInstitutionCountry',
        'ResearchInstitutionName',
        'ResearchLocationRegion',
        'ResearchLocationCountry',
        'EthicsStatus',
        'Outcomes',
        'RecruitmentStatus',
        'RegistrationYear',
        'StudySubject',
        'StudyType',
        'AgeGroups',
        'VulnerablePopulations',
        'OccupationalGroups',
        'Gender',
        'Phase',
        'TrialID',
    ]),
    highlightFields: ['TrialTitle', 'TrialTitleScientific', 'TrialTitlePublic'],
    listSourceFields: [
        'TrialTitle',
        'TrialNumber',
        'Register',
        'RegistrationYear',
        'Diseases',
        'SourceLink',
        'RecruitmentStatus',
        'StudyType',
    ],
    showSourceFields: ['TrialTitle', 'TrialTitleScientific', 'TrialTitlePublic'],
    supportsJointFunding: false,
    supportsCoLocated: true,
}

export const searchDatasets: Record<string, SearchDatasetConfig> = {
    grants: grantsSearchDataset,
    'clinical-trials': clinicalTrialsSearchDataset,
}

/** Resolve a dataset config by key, defaulting to grants. */
export function getSearchDataset(key: string = 'grants'): SearchDatasetConfig {
    return searchDatasets[key] ?? grantsSearchDataset
}

export function getSearchClient() {
    if (
        !process.env.SEARCH_HOST ||
        !process.env.SEARCH_USERNAME ||
        !process.env.SEARCH_PASSWORD
    ) {
        return null
    }

    return new Client({
        node: process.env.SEARCH_HOST,
        auth: {
            username: process.env.SEARCH_USERNAME,
            password: process.env.SEARCH_PASSWORD,
        },
        ssl: {
            rejectUnauthorized: false,
        },
    })
}

export function getIndexName(baseName: string = 'grants') {
    const prefix = process.env.SEARCH_INDEX_PREFIX
        ? `${normaliseBranchName(process.env.SEARCH_INDEX_PREFIX)}-`
        : ''

    const version = process.env.SEARCH_INDEX_VERSION
        ? `-${process.env.SEARCH_INDEX_VERSION}`
        : ''

    // The prefix is often a Git branch name (e.g. on preview deploys), which can
    // contain characters OpenSearch forbids in index names — most notably the "/"
    // in branch names like "feature/clinical-trials". Lowercase and replace any
    // disallowed character with a hyphen so the resulting index name is valid.
    // Both the build-time indexer and the runtime API routes call this function,
    // so they stay in sync.
    return `${prefix}${baseName}${version}`
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
}

export function searchUnavailableResponse() {
    return NextResponse.json(
        {
            error: 'Service Unavailable',
        },
        {
            status: 503,
            statusText: 'Service Unavailable',
        },
    )
}

/** Shared validation for the two independent co-located parameters. */
function validateCoLocatedValue(
    parameterName: string,
    value: unknown,
    addError: (message: string) => void,
) {
    if (typeof value !== 'string') {
        addError(`The ${parameterName} parameter must be a string`)
        return
    }

    const isValid = coLocatedFilterOptions.some(option => option.value === value)

    if (!isValid) {
        addError(
            `The ${parameterName} parameter must be one of the following values: ` +
                coLocatedFilterOptions.map(option => option.value).join(', '),
        )
    }
}

export async function validateRequest(
    request: Request,
    fieldsToValidate: string[],
) {
    const rules = {
        q: (addError: (message: string) => void) => {
            if (typeof parameters.q !== 'string') {
                addError('The q parameter must be a string')
            }
        },

        filters: (addError: (message: string) => void) => {
            if (typeof parameters.filters !== 'object') {
                addError('The filters parameter must be an object')
            }
        },

        jointFunding: (addError: (message: string) => void) => {
            if (typeof parameters.jointFunding !== 'string') {
                addError('The jointFunding parameter must be a string')
            }

            const validJointFundingOption = jointFundingFilterOptions.some(
                option => option.value === parameters.jointFunding,
            )

            if (!validJointFundingOption) {
                addError(
                    'The jointFunding parameter must be one of the following values: ' +
                        jointFundingFilterOptions
                            .map(option => option.value)
                            .join(', '),
                )
            }
        },

        coLocatedLocation: (addError: (message: string) => void) => {
            validateCoLocatedValue('coLocatedLocation', parameters.coLocatedLocation, addError)
        },

        coLocatedInstitution: (addError: (message: string) => void) => {
            validateCoLocatedValue('coLocatedInstitution', parameters.coLocatedInstitution, addError)
        },

        page: (addError: (message: string) => void) => {
            if (typeof parameters.page !== 'number') {
                addError('The page parameter must be a number')
            }

            if (parameters.page < 0) {
                addError('The page parameter must be greater than 0')
            }
        },

        limit: (addError: (message: string) => void) => {
            if (typeof parameters.limit !== 'number') {
                addError('The limit parameter must be a number')
            }

            if (parameters.limit > 100) {
                addError(
                    'The limit parameter must be less than or equal to 100',
                )
            }

            if (parameters.limit <= 0) {
                addError('The limit parameter must be greater than 0')
            }
        },
    }

    const parameters = await request.json().catch(() => Promise.resolve({}))

    const allErrors: any = {}

    const values: any = {}

    for (const [field, rule] of Object.entries(rules)) {
        if (!fieldsToValidate.includes(field)) {
            continue
        }

        if (parameters[field] === undefined) {
            continue
        }

        const errors: any = []

        const addError = (message: string) => {
            errors.push(message)
        }

        rule(addError)

        if (errors.length > 0) {
            allErrors[field] = errors
        } else {
            values[field] = parameters[field]
        }
    }

    if (Object.keys(allErrors).length > 0) {
        return {
            errorResponse: NextResponse.json(
                {
                    allErrors,
                },
                {
                    status: 422,
                    statusText: 'Unprocessable Entity',
                },
            ),
        }
    }

    return { values }
}

/** Independent co-located selections, one per geography field (Technical Spec §6.1). */
export interface CoLocatedSelection {
    location?: string
    institution?: string
}

export function getBooleanQuery(
    q: string,
    filters: SearchFilters,
    dataset: SearchDatasetConfig = grantsSearchDataset,
    jointFunding: string = 'all-grants',
    coLocated: CoLocatedSelection = {},
) {
    return {
        bool: {
            ...prepareMustClause(q, dataset),
            ...prepareFilterClause(filters, dataset, jointFunding, coLocated),
        },
    }
}

function prepareMustClause(q: string, dataset: SearchDatasetConfig) {
    if (!q) {
        return {}
    }

    const query = q
        .replace(/\bAND\b/g, '+')
        .replace(/\bOR\b/g, '|')
        .replace(/\bNOT\s+/g, '-')

    return {
        must: {
            simple_query_string: {
                query,
                fields: dataset.fullTextFields,
                flags: 'AND|OR|NOT|PHRASE|PRECEDENCE|WHITESPACE|ESCAPE',
            },
        },
    }
}

function prepareFilterClause(
    filters: SearchFilters,
    dataset: SearchDatasetConfig,
    jointFunding: string,
    coLocated: CoLocatedSelection,
) {
    const outerMust: any[] = []

    const validFilters = filters?.filters?.filter(
        ({ field, values }) =>
            dataset.allowedFilterFields.has(field) &&
            Array.isArray(values) &&
            values.length > 0
    ) ?? []

    if (validFilters.length > 0) {
        // Build one inner bool per row, honouring the per-row AND/OR operator
        // for combining the values within that row.
        const rowClauses = validFilters.map(({ field, values, logicalAnd }) => {
            const terms = values.map(value => ({
                term: {
                    [field]: value,
                },
            }))

            if (logicalAnd) {
                return {
                    bool: {
                        must: terms,
                    },
                }
            }

            return {
                bool: {
                    should: terms,
                    minimum_should_match: 1,
                },
            }
        })

        // Combine the rows using the global AND/OR operator. Wrapping this in
        // its own bool keeps the user-defined combinator independent of the
        // joint-funding constraint below — otherwise an outer `must` clause
        // would silently make the `should` rows optional in OpenSearch.
        if (filters.logicalAnd) {
            outerMust.push({
                bool: {
                    must: rowClauses,
                },
            })
        } else {
            outerMust.push({
                bool: {
                    should: rowClauses,
                    minimum_should_match: 1,
                },
            })
        }
    }

    if (dataset.supportsJointFunding) {
        if (jointFunding === 'only-joint-funded-grants') {
            outerMust.push({
                term: {
                    JointFunding: true,
                },
            })
        } else if (jointFunding === 'exclude-joint-funded-grants') {
            outerMust.push({
                term: {
                    JointFunding: false,
                },
            })
        }
    }

    if (dataset.supportsCoLocated) {
        // Location and institution co-location are filtered independently against
        // their own precomputed flags (Technical Spec §6.1 — no fallback between
        // the two). Each selection adds its own term clause to the outer `must`.
        const coLocatedClauses: { field: string; value: string | undefined }[] = [
            { field: 'CoLocatedByLocation', value: coLocated.location },
            { field: 'CoLocatedByInstitution', value: coLocated.institution },
        ]

        coLocatedClauses.forEach(({ field, value }) => {
            if (value === 'only-co-located-trials') {
                outerMust.push({ term: { [field]: true } })
            } else if (value === 'exclude-co-located-trials') {
                outerMust.push({ term: { [field]: false } })
            }
        })
    }

    return {
        filter: {
            bool: {
                must: outerMust,
            },
        },
    }
}

export async function fetchAllIdsInIndex(
    client: Client,
    dataset: SearchDatasetConfig = grantsSearchDataset,
) {
    return fetchAllIdsMatchingBooleanQuery(client, '', {
        filters: [],
        logicalAnd: false,
    }, dataset)
}

export async function fetchAllIdsMatchingBooleanQuery(
    client: Client,
    q: string,
    filters: SearchFilters,
    dataset: SearchDatasetConfig = grantsSearchDataset,
    jointFunding: string = 'all-grants',
    coLocated: CoLocatedSelection = {},
) {
    const index = getIndexName(dataset.indexBaseName)

    const query = getBooleanQuery(q, filters, dataset, jointFunding, coLocated)

    const ids = []

    const size = 1000

    let hits = []

    let searchAfterClause = {}

    do {
        const results = await client.search({
            index,

            // Don't return any document because we only need the _id from OpenSearch
            _source: [],

            size,

            body: {
                query,

                sort: [
                    {
                        [dataset.idField]: { order: 'asc' },
                    },
                ],

                ...searchAfterClause,
            },
        })

        hits = results.body.hits.hits

        for (const hit of hits) {
            ids.push(hit._id)
        }

        if (hits.length > 0) {
            searchAfterClause = {
                search_after: hits[hits.length - 1].sort,
            }
        }
    } while (hits.length === size)

    return ids
}
