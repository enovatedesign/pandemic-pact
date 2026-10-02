// Grants dataset collection: https://figshare.com/s/9e712aa1f4255e37b0db
// Clinical Trials dataset collection: https://figshare.com/s/d7f57abee9d05c21eec7
export default {
    FIGSHARE_COLLECTION: 'https://figshare.com/s/9e712aa1f4255e37b0db',
    // Small static lookup committed into the repo (read locally at build time).
    RESEARCH_CATEGORIES_FILE: 'scripts/config/data/research-categories.csv',
    // CORC sandbox export, merged in only when EBOLA_SANDBOX_OVERLAY=true (see ebola-sandbox-overlay.ts).
    EBOLA_SANDBOX_GRANTS_FILE: 'scripts/config/data/ebola-sandbox/grants.csv',
    EBOLA_SANDBOX_DICTIONARY_FILE: 'scripts/config/data/ebola-sandbox/dictionary.csv',
    FIGSHARE_ARTICLE_ID: 26937448,
    FIGSHARE_GRANTS_FILE_ID: 69426018,
    FIGSHARE_DATA_DICTIONARY_FILE_ID: 69425991,
    FIGSHARE_OUTBREAKS_FILE_ID: 66439073,
    FIGSHARE_CLINICAL_TRIALS_FILE_ID: 69420063,
    FIGSHARE_CLINICAL_TRIALS_DATA_DICTIONARY_FILE_ID: 69420060,
    FIGSHARE_RRNA_ARTICLE_ID: 31325617,
    FIGSHARE_RRNA_FILE_ID: 66823328,
    FIGSHARE_RRNA_DATA_DICTIONARY_FILE_ID: 66859574,
} as const