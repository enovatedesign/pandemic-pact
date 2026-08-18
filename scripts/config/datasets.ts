import { keyMapping as grantsKeyMapping } from '../helpers/key-mapping'
import { clinicalTrialsKeyMapping } from '../helpers/clinical-trials-key-mapping'
import dataSources from './data-sources'

/**
 * A DatasetConfig captures everything that differs between the two datasets the
 * app serves — Funding Awards ("grants") and Clinical Research Registrations
 * ("clinical-trials"). The generic pipeline steps (download/parse, prepare,
 * select-options, search) take a DatasetConfig as a parameter so that dataset
 * differences live in *data* (this file) rather than in branching control flow.
 *
 * Genuinely dataset-specific transformation logic (e.g. the grants-only mpox /
 * ebola / investigator handling) stays in that dataset's own prepare step; it is
 * not forced into a shared conditional.
 */
export interface DatasetConfig {
    /** Stable key used in routes, output paths and the search index base name. */
    key: 'grants' | 'clinical-trials'

    /** Human label, mainly for logging. */
    label: string

    /**
     * Where the source CSV comes from. Figshare file ids are downloaded at build
     * time with an authenticated `ndownloader` request (needs `FIGSHARE_PA_TOKEN`).
     */
    source: {
        figshareArticleId?: number
        figshareFileId?: number
        dataDictionaryFileId?: number
    }

    /**
     * CSV column name -> our PascalCase field name. Columns not listed here are
     * dropped (unless retainOriginalKeys is used). Checkbox (`field___code`) and
     * multi-value fields are handled separately via the prefixes below.
     */
    keyMapping: { [csvColumn: string]: string }

    /**
     * Substrings used to aggregate one-hot REDCap checkbox columns that are split
     * across pathogen families (e.g. `coronaviridae_pathogen___840533007`). Each
     * entry maps the substring matched in the raw column name to the output field
     * the checked codes are collected into. Identical mechanism in both datasets.
     */
    multiValueFieldPrefixes: { match: string; field: string }[]

    /**
     * Plain comma-separated text columns that should be exploded into arrays
     * (as opposed to REDCap `___` checkbox columns, which are detected
     * automatically by the presence of `___` in the heading).
     */
    commaSeparatedFields: string[]

    /** Base name for the OpenSearch index (prefix/version are applied at runtime). */
    searchIndexBaseName: string

    /** The document's unique id field (used as the OpenSearch _id). */
    idField: string

    /** Output file locations for this dataset's generated artefacts. */
    outputPaths: {
        /** gzipped, fully-processed records consumed by select-options + search. */
        distGz: string
        /** select-options written for server-side use. */
        selectOptionsJson: string
        /** per-field select-options written for the frontend to fetch. */
        publicSelectOptionsDir: string
        /** the records file the visualise page fetches client-side. */
        visualisePublicJson: string
    }
}

const grants: DatasetConfig = {
    key: 'grants',
    label: 'Funding Awards',
    source: {
        figshareArticleId: dataSources.FIGSHARE_ARTICLE_ID,
        figshareFileId: dataSources.FIGSHARE_GRANTS_FILE_ID,
        dataDictionaryFileId: dataSources.FIGSHARE_DATA_DICTIONARY_FILE_ID,
    },
    keyMapping: grantsKeyMapping,
    multiValueFieldPrefixes: [
        { match: '_pathogen__', field: 'Pathogens' },
        { match: '_diseases__', field: 'Diseases' },
        { match: '_diseases_strains_', field: 'Strains' },
    ],
    commaSeparatedFields: [
        'research_institution_country',
        'research_institution_country_iso',
        'research_location_country',
        'research_location_country_iso',
        'main_research_priority_area_number_new',
        'main_research_sub_priority_number_new',
    ],
    searchIndexBaseName: 'grants',
    idField: 'GrantID',
    outputPaths: {
        distGz: './data/dist/grants.json.gz',
        selectOptionsJson: './data/dist/select-options.json',
        publicSelectOptionsDir: './public/data/select-options',
        visualisePublicJson: './public/data/grants.json',
    },
}

const clinicalTrials: DatasetConfig = {
    key: 'clinical-trials',
    label: 'Clinical Research Registrations',
    source: {
        // The dataset + dictionary are published on Figshare (private link
        // d7f57abee9d05c21eec7); downloaded at build time via the authenticated
        // ndownloader endpoint (needs FIGSHARE_PA_TOKEN).
        figshareFileId: dataSources.FIGSHARE_CLINICAL_TRIALS_FILE_ID,
        dataDictionaryFileId: dataSources.FIGSHARE_CLINICAL_TRIALS_DATA_DICTIONARY_FILE_ID,
    },
    keyMapping: clinicalTrialsKeyMapping,
    // Disease coding is encoded identically to grants (per-family one-hot columns
    // such as `coronaviridae_pathogen___…`), so the same aggregation prefixes work.
    multiValueFieldPrefixes: [
        { match: '_pathogen__', field: 'Pathogens' },
        { match: '_diseases__', field: 'Diseases' },
        { match: '_diseases_strains_', field: 'Strains' },
    ],
    commaSeparatedFields: [
        'research_location_country_iso',
        'research_institution_country_iso',
    ],
    searchIndexBaseName: 'clinical-trials',
    idField: 'TrialID',
    outputPaths: {
        distGz: './data/dist/clinical-trials/trials.json.gz',
        selectOptionsJson: './data/dist/clinical-trials/select-options.json',
        publicSelectOptionsDir: './public/data/clinical-trials/select-options',
        visualisePublicJson: './public/data/clinical-trials/trials.json',
    },
}

export const datasets = { grants, clinicalTrials } as const

export default datasets
