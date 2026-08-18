import fs from 'fs-extra'
import _ from 'lodash'
import zlib from 'zlib'
import path from 'path'

import { RawGrant } from '../types/generate'
import { DatasetConfig } from '../config/datasets'
import { streamLargeJson, createJsonArrayWriteStream } from '../helpers/stream-io'
import {
    convertKeysUsingMapping,
    convertRawGrantKeyToValuesArray,
    convertCheckBoxFieldToArray,
    convertCommaSeparatedValueFieldToArray,
} from '../helpers/key-mapping'
import { registerCanonicalCodes, reportUnresolvedCodes } from '../helpers/redcap-codes'
import { title, info, printWrittenFileStats } from '../helpers/log'

/**
 * Prepares the Clinical Research Registrations (ICTRP) records.
 *
 * Deliberately thinner than prepare-grants.ts: it reuses the same generic REDCap
 * helpers (checkbox/comma-separated explosion, key renaming) but contains none of
 * the grants-only logic (mpox priorities, ebola CORC, investigators, etc.).
 *
 * Reads the already-parsed download produced by the ingestion step at
 * `data/download/clinical-trials/{trials.json,trials-headings.json}` and writes
 * the processed records to the locations declared on the DatasetConfig.
 */
export default async function prepareTrials(config: DatasetConfig) {
    title('Preparing clinical trials')

    const downloadDir = './data/download/clinical-trials'

    const headings: string[] = fs.readJsonSync(`${downloadDir}/trials-headings.json`)

    // Install the CT dictionary's canonical codes, replacing the grants one that
    // prepareGrants registered earlier in the same process. See prepare-grants.ts
    // and helpers/redcap-codes.ts for why this is needed.
    registerCanonicalCodes(
        fs.readJsonSync(`${downloadDir}/dictionary.json`),
        'Clinical trials',
    )

    // Checkbox (one-hot) fields are identified by `___` in the column name.
    const [checkboxColumns, nonCheckboxColumns] = _.partition(headings, h =>
        h.includes('___'),
    )

    // Unique checkbox field *base* names (e.g. `phase`, `coronaviridae_pathogen`).
    const checkboxFields = _.uniq(checkboxColumns.map(c => c.split('___')[0]))

    // Plain comma-separated text columns that should become arrays.
    const commaSeparatedFields = config.commaSeparatedFields.filter(f =>
        nonCheckboxColumns.includes(f),
    )

    const stringFields = nonCheckboxColumns.filter(
        f => !commaSeparatedFields.includes(f),
    )

    // Prepare output paths/dirs.
    const distGzPath = config.outputPaths.distGz
    fs.ensureDirSync(path.dirname(distGzPath))

    const uncompressedDistPath = distGzPath.replace(/\.gz$/, '')
    const writer = createJsonArrayWriteStream(uncompressedDistPath)

    let processedCount = 0
    let outOfScopeCount = 0

    await streamLargeJson(`${downloadDir}/trials.json`, (rawTrial: RawGrant) => {
        // Out-of-scope records are dropped at the earliest possible point so every
        // downstream artefact (visualise JSON, select-options, per-trial files, CSV
        // export and the search index) is built from the in-scope set alone.
        //
        // `trial_in_scope` is a REDCap yesno field: '0' = No, '1' = Yes. Anything
        // else — 'N/A' or blank (not yet reviewed) — is treated as in scope, per
        // the data owners' instruction to exclude only explicit "No" records.
        if (isOutOfScope(rawTrial)) {
            outOfScopeCount++
            return
        }

        processedCount++

        if (processedCount % 1000 === 0) {
            info(`Processed ${processedCount} trials`)
        }

        // String fields, kept as-is.
        const stringFieldValues = _.pick(rawTrial, stringFields)

        // Checkbox fields -> arrays of checked codes (per base name).
        const checkboxFieldValues = Object.fromEntries(
            checkboxFields.map(field => [
                field,
                convertCheckBoxFieldToArray(rawTrial, field),
            ]),
        )

        // Comma-separated fields -> arrays.
        const commaSeparatedFieldValues = Object.fromEntries(
            commaSeparatedFields.map(field => [
                field,
                convertCommaSeparatedValueFieldToArray(rawTrial, field),
            ]),
        )

        // Rename to our field names, dropping anything not in the mapping (this
        // discards the per-family pathogen/disease/strain checkbox columns, which
        // are re-aggregated below into Pathogens/Diseases/Strains).
        const converted = convertKeysUsingMapping(
            {
                ...stringFieldValues,
                ...checkboxFieldValues,
                ...commaSeparatedFieldValues,
            },
            config.keyMapping,
        )

        // Aggregate the per-family disease taxonomy columns into flat arrays,
        // identical to grants.
        const multiValueFields = Object.fromEntries(
            config.multiValueFieldPrefixes.map(({ match, field }) => [
                field,
                convertRawGrantKeyToValuesArray(rawTrial, match),
            ]),
        )

        // Combined interventions (main OR secondary) — the Intervention filter and
        // Viz 3/4 match on either (Technical Spec §3.1 and Visualisation 3/4).
        const interventions = _.uniq([
            ...((converted.MainIntervention as string[]) ?? []),
            ...((converted.SecondaryIntervention as string[]) ?? []),
        ])

        const trial = {
            ...converted,
            ...multiValueFields,
            Interventions: interventions,
            InterventionNames: interventionNames(rawTrial),
            // Derived linked-trials flag (Technical Spec §3.4 / §6.4):
            // a trial is "linked" when related_trial_record === '1'.
            LinkedTrial: rawTrial.related_trial_record === '1',
        }

        writer.writeItem(trial)
    })

    await writer.end()

    // Gzip for select-options + search consumption.
    info('Creating gzipped version...')
    const jsonBuffer = fs.readFileSync(uncompressedDistPath)
    const gzipBuffer = zlib.gzipSync(jsonBuffer as any)
    fs.writeFileSync(distGzPath, new Uint8Array(gzipBuffer))
    printWrittenFileStats(distGzPath)

    // Also write the uncompressed records the visualise page fetches client-side.
    const visualisePath = config.outputPaths.visualisePublicJson
    fs.ensureDirSync(path.dirname(visualisePath))
    fs.copyFileSync(uncompressedDistPath, visualisePath)
    printWrittenFileStats(visualisePath)

    fs.unlinkSync(uncompressedDistPath)

    info(`Excluded ${outOfScopeCount} out-of-scope trials (trial_in_scope = No)`)
    info(`Processed ${processedCount} trials total`)

    reportUnresolvedCodes('Clinical trials')
}

/**
 * The free-text intervention names, collected from the numbered
 * `interventions_name_1..10` columns plus the semicolon-separated
 * `interventions_name_other`. Shown on the trial page in place of the withdrawn
 * `interventions_raw` column.
 */
function interventionNames(rawTrial: RawGrant): string[] {
    const numbered = _.range(1, 11).map(
        n => (rawTrial as any)[`interventions_name_${n}`],
    )

    const other = String((rawTrial as any).interventions_name_other ?? '').split(';')

    return [...numbered, ...other]
        .map(value => String(value ?? '').trim())
        .filter(value => value !== '' && value !== 'N/A')
}

/**
 * True when the record is explicitly marked as out of scope.
 *
 * Only an explicit "No" excludes a record — 'N/A', an empty value and a missing
 * column all keep it in, so a record that has not been scope-reviewed yet is
 * still published.
 */
function isOutOfScope(rawTrial: RawGrant): boolean {
    const value = String((rawTrial as any).trial_in_scope ?? '').trim().toLowerCase()

    return value === '0' || value === 'no'
}
