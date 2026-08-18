import fs from 'fs-extra'
import _ from 'lodash'
import zlib from 'zlib'
import path from 'path'

import { DatasetConfig } from '../config/datasets'
import { title, info, printWrittenFileStats } from '../helpers/log'
import { parseSelectOptionsFromChoices } from './prepare-select-options'

type DictRow = { [key: string]: string }
type Option = { value: string; label: string }

/**
 * Builds select-options (filter dropdown values + labels) for the clinical-trials
 * dataset from its REDCap data dictionary.
 *
 * Differs from the grants builder in two ways:
 *  - It parses dropdown / radio / yesno field types as well as checkbox (CT codes
 *    several fields, e.g. recruitment_status, as dropdowns).
 *  - Family/pathogen/disease/region labels come from the CT dictionary itself
 *    (self-contained), while country options are reused from grants (shared
 *    ISO-numeric coding).
 */
export default function prepareTrialsSelectOptions(config: DatasetConfig) {
    title('Generating clinical trials select options')

    const downloadDir = './data/download/clinical-trials'
    const dictionary: DictRow[] = fs.readJsonSync(`${downloadDir}/dictionary.json`)

    // Records (for deriving options from free-text fields).
    const gzipBuffer = fs.readFileSync(config.outputPaths.distGz)
    const trials: any[] = JSON.parse(
        zlib.gunzipSync(gzipBuffer as any).toString(),
    )

    // dictionary variable name -> [{value,label}] for every coded field.
    const codedTypes = new Set(['checkbox', 'dropdown', 'radio'])
    const rawOptions: { [variable: string]: Option[] } = {}

    for (const row of dictionary) {
        const variable = row['Variable / Field Name']
        const type = row['Field Type']
        const choices = row['Choices, Calculations, OR Slider Labels']?.trim()

        if (codedTypes.has(type) && choices) {
            rawOptions[variable] = parseSelectOptionsFromChoices(choices)
        }
    }

    // Aggregate the per-family taxonomy fields into flat, de-duplicated lists.
    const aggregate = (predicate: (variable: string) => boolean) =>
        _.uniqBy(
            Object.entries(rawOptions)
                .filter(([variable]) => predicate(variable))
                .flatMap(([, options]) => options),
            'value',
        ).sort((a, b) => a.label.localeCompare(b.label))

    const Pathogens = aggregate(v => v.endsWith('_pathogen'))
    const Diseases = aggregate(v => v.endsWith('_diseases'))
    const Strains = aggregate(v => v.endsWith('_diseases_strains'))

    // Map remaining single coded fields through the dataset key-mapping so they
    // are keyed by our field names (e.g. main_intervention -> MainIntervention).
    const mappedOptions: { [field: string]: Option[] } = {}
    for (const [variable, options] of Object.entries(rawOptions)) {
        const mapped = config.keyMapping[variable]
        if (mapped) {
            mappedOptions[mapped] = options
        }
    }

    // Country options are shared with grants (identical ISO-numeric coding).
    const grantsCountryOptions = readGrantsCountryOptions()

    const selectOptions: { [field: string]: Option[] } = {
        ...mappedOptions,

        Families: rawOptions['families'] ?? [],
        Pathogens,
        Diseases,
        Strains,

        // Combined intervention filter (main OR secondary) shares the
        // main_intervention option set.
        Interventions: rawOptions['main_intervention'] ?? [],

        // Country fields reuse the grants country list.
        ResearchLocationCountry: _.cloneDeep(grantsCountryOptions),
        ResearchInstitutionCountry: _.cloneDeep(grantsCountryOptions),

        // Region "_all" variants share the base region options.
        ResearchLocationRegionAll: _.cloneDeep(
            mappedOptions.ResearchLocationRegion ?? [],
        ),

        // Free-text fields: derive distinct values from the data.
        // Year filter is locked to 2020 onwards, mirroring the grants dataset.
        RegistrationYear: uniqueValues(trials, 'RegistrationYear').filter(
            o => /^\d{4}$/.test(o.value) && Number(o.value) >= 2020,
        ),
        Register: uniqueValues(trials, 'Register'),
        ResearchInstitutionName: uniqueValues(trials, 'ResearchInstitutionName'),
    }

    // Write a combined file (server-side) and one file per field (frontend fetch).
    const distPath = config.outputPaths.selectOptionsJson
    fs.ensureDirSync(path.dirname(distPath))
    fs.writeJsonSync(distPath, selectOptions)
    printWrittenFileStats(distPath)

    const publicDir = config.outputPaths.publicSelectOptionsDir
    fs.emptyDirSync(publicDir)
    Object.entries(selectOptions).forEach(([field, options]) => {
        const pathname = `${publicDir}/${field}.json`
        fs.writeJsonSync(pathname, options)
    })

    info(`Wrote ${Object.keys(selectOptions).length} CT select-option fields`)
}

function readGrantsCountryOptions(): Option[] {
    // Prefer the generated grants dist select-options; fall back to the public file.
    const distPath = './data/dist/select-options.json'
    if (fs.existsSync(distPath)) {
        const all = fs.readJsonSync(distPath)
        if (all.FunderCountry) return all.FunderCountry
    }

    const publicPath = './public/data/select-options/FunderCountry.json'
    if (fs.existsSync(publicPath)) {
        return fs.readJsonSync(publicPath)
    }

    info('Grants country options not found — CT country filters will be empty until grants generation runs')
    return []
}

function uniqueValues(records: any[], key: string): Option[] {
    return _.uniq(records.map(r => r[key]))
        .filter(value => value && value !== 'N/A')
        .sort()
        .map(value => ({ value: String(value), label: String(value) }))
}
