import fs from 'fs-extra'
import dataSources from '../config/data-sources'
import downloadCsvAndConvertToJson from './download-and-convert-to-json'
import { info } from './log'
import { RawGrant } from '../types/generate'

// Temporary: merges CORC's sandbox Ebola priority export into the master Figshare
// data until the master Grants dataset carries these fields. Delete this file, the
// ebola-sandbox CSVs and its call sites once the Figshare file IDs are bumped.

type Row = { [key: string]: string }

const SANDBOX_GRANTS_PATH = './data/download/ebola-sandbox-grants.json'

const isOverlayColumn = (column: string) =>
    column === 'research_and_policy_roadmaps___27' || column.startsWith('ebola_priorit')

const isOverlayDictionaryField = (field: string) =>
    field === 'research_and_policy_roadmaps' || field.startsWith('ebola_priorit')

// fast-csv keeps the UTF-8 BOM that REDCap exports start with
const stripBom = (row: Row): Row =>
    Object.fromEntries(Object.entries(row).map(([key, value]) => [key.replace(/^﻿/, ''), value]))

/**
 * Overlaid artefacts must never reach the shared blob cache or search index that
 * production builds use, so callers also skip uploads while this is on.
 */
export function isEbolaSandboxOverlayEnabled() {
    if (process.env.EBOLA_SANDBOX_OVERLAY !== 'true') {
        return false
    }

    if (process.env.VERCEL_ENV === 'production') {
        throw new Error('EBOLA_SANDBOX_OVERLAY must not be set on production builds')
    }

    return true
}

/** Rewrites the downloaded dictionary and headings, and stages the sandbox grant rows. */
export async function applyEbolaSandboxOverlay() {
    info('EBOLA_SANDBOX_OVERLAY set — merging the sandbox Ebola priority fields')

    await downloadCsvAndConvertToJson(dataSources.EBOLA_SANDBOX_DICTIONARY_FILE, 'ebola-sandbox-dictionary')
    await downloadCsvAndConvertToJson(dataSources.EBOLA_SANDBOX_GRANTS_FILE, 'ebola-sandbox-grants')

    const sandboxDictionary: Row[] = fs.readJsonSync('./data/download/ebola-sandbox-dictionary.json').map(stripBom)
    const sandboxGrants: Row[] = fs.readJsonSync(SANDBOX_GRANTS_PATH).map(stripBom)

    const dictionaryPath = './data/download/dictionary.json'
    const dictionary: Row[] = fs.readJsonSync(dictionaryPath)
    const overlayRows = sandboxDictionary.filter(row => isOverlayDictionaryField(row['Variable / Field Name']))
    const overlayFields = overlayRows.map(row => row['Variable / Field Name'])

    fs.writeJsonSync(dictionaryPath, [
        ...dictionary.filter(row => !overlayFields.includes(row['Variable / Field Name'])),
        ...overlayRows,
    ])

    const headingsPath = './data/download/grants-headings.json'
    const headings: string[] = fs.readJsonSync(headingsPath)
    const overlayColumns = Object.keys(sandboxGrants[0]).filter(isOverlayColumn)

    fs.writeJsonSync(headingsPath, [...headings, ...overlayColumns.filter(column => !headings.includes(column))])

    fs.writeJsonSync(SANDBOX_GRANTS_PATH, sandboxGrants)
}

/** Returns a function that copies the sandbox columns onto a raw grant (zeroed when absent). */
export function createEbolaSandboxGrantOverlay() {
    const sandboxGrants: Row[] = fs.readJsonSync(SANDBOX_GRANTS_PATH)
    const overlayColumns = Object.keys(sandboxGrants[0]).filter(isOverlayColumn)
    const rowsByPactId = new Map(sandboxGrants.map(row => [row.pactid, row]))

    return (rawGrant: RawGrant) => {
        const sandboxRow = rowsByPactId.get(rawGrant.pactid)

        overlayColumns.forEach(column => {
            rawGrant[column] = sandboxRow?.[column] ?? '0'
        })
    }
}
