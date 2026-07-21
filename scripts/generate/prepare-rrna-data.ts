import fs from 'fs-extra'
import readLargeJson from '../helpers/read-large-json'
import { title, info, printWrittenFileStats } from '../helpers/log'
import { map } from 'lodash'

interface RrnaDictionaryEntry {
    [key: string]: string
}

const titleCase = (str: string) => {
    return str
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
}

/* 
   For certain fields, we want to apply specific transformations to clean up the
   option values for better display in the UI. This map defines those 
   transformations based on the field key. 
*/
const replacementMap: Record<string, (str: string) => string> = {
    // For the "Research Domain" field, we want to remove the "Domain X: " prefix from the option values
    'Domains': (str) => str.replace(/^Domain\s+\d+[a-z]?:?\s*/i, ''),
}

/* 
   These fields represent groupings of related variables in the original data.
   After processing, we will combine the individual variables that belong to 
   these groups into a single array field in the final output.
*/
const groupFields = ['Diseases', 'Pathogen', 'Strains']

const explicitRules: Record<string, any> = {}

/*
   For some checkbox/radio fields the exported REDCap dictionary labels are
   unsuitable for display (they carry HTML markup and admin-only wording). For
   these we map the REDCap choice code directly to a clean display label. Codes
   that are not listed here are intentionally dropped from the output.

   age_groups_rrna: the dashboard only presents the four population groups
   defined in the RRNA technical specification (codes 3, 7, 10, 11); the
   granular/admin/unspecified codes are excluded.
*/
const codeLabelOverrides: Record<string, Record<string, string>> = {
    'AgeGroupsRrna': {
        '3': 'Children',
        '7': 'Adults',
        '10': 'Pregnant women',
        '11': 'Not reported',
    },
}

export default async function prepareRrna() {
    title('Preparing RRNA Data')
 
    const dataDictionary = await fs.readJson('./data/download/rrna-data-dictionary.json') as RrnaDictionaryEntry[]

    // Create a mapping of variable names to their types and options for easier processing
    const dictionaryMap: Record<string, any> = {}
    dataDictionary.forEach(entry => {
        const variableName = entry['Variable / Field Name']
        const type = entry['Field Type']
        const mapEntry: Record<string, any> = {
            key: titleCase(variableName),
            type,
        }

        if (type === 'checkbox' || type === 'radio') {
            mapEntry['options'] = entry['Choices, Calculations, OR Slider Labels'].split(' | ').map(option => {
                // Split on the first comma only — the code is everything before it
                // and the label everything after. Some labels contain commas
                // (e.g. "Domain 1: Clinical characteristics, epidemiology"), which
                // a naive split(',') would truncate.
                const separatorIndex = option.indexOf(',')
                const code = option.slice(0, separatorIndex).trim()
                const value = option.slice(separatorIndex + 1).trim()
                return { code, value }
            })
        }

        dictionaryMap[variableName] = mapEntry
    })

    const rawRrnaArray = await readLargeJson('./data/download/rrna-data.json') as any[]

    // Process each RRNA entry and convert it to the desired format
    const rrnaData = rawRrnaArray.map((rawRrnaData, index, array) => {
        if (index > 0 && index % 500 === 0) {
            info(`Processed ${index} of ${array.length} RRNA objects.`)
        }

        const convertedData: Record<string, any> = {}

        for (const [key, value] of Object.entries(rawRrnaData)) {
            const variableName = key.split('___')[0] || key
            let variableCode = key.split('___')[1] || null

            const mapEntry = dictionaryMap[variableName]

            if (!mapEntry) {
                // console.warn(`No dictionary entry found for variable: ${variableName}`)
                continue
            }

            // First check if there are any explicit rules for this key, and apply the transformation if so
            if (explicitRules[mapEntry.key]) {
                const transformedValue = explicitRules[mapEntry.key](value)

                if (transformedValue !== null) {
                    convertedData[mapEntry.key] = transformedValue
                    continue
                }
            }

            const isCodeField = (key: string) =>
                ['Families', 'Pathogen', 'Diseases', 'StudyCountry', 'Strains'].some(group => key.endsWith(group));

            if (mapEntry.type === 'checkbox') {
                variableCode = variableCode || (typeof value === 'string' ? value : null);

                if (!convertedData[mapEntry.key]) {
                    convertedData[mapEntry.key] = [];
                }

                if (value === '1' && variableCode) {
                    let optionValue: any;

                    // Exception: use variableCode for Families, Pathogen, Diseases and StudyCountry (case-insensitive)
                    if (isCodeField(mapEntry.key)) {
                        optionValue = variableCode;
                    } else if (codeLabelOverrides[mapEntry.key]) {
                        // Clean, curated label by code (unlisted codes are dropped)
                        optionValue = codeLabelOverrides[mapEntry.key][variableCode] ?? null;
                    } else {
                        const option = mapEntry.options.find((opt: any) => opt.code === variableCode);
                        optionValue = option ? option.value : null;

                        if (optionValue && replacementMap[mapEntry.key]) {
                            optionValue = replacementMap[mapEntry.key](optionValue);
                        }
                    }

                    if (optionValue != null) {
                        convertedData[mapEntry.key].push(optionValue);
                    }
                }
            } else if (mapEntry.type === 'radio') {
                variableCode = variableCode || (typeof value === 'string' ? value : null);

                if (value && value != '0' && variableCode) {
                    let optionValue: any;

                    // Exception: use variableCode for Families, Pathogen, Diseases and StudyCountry (case-insensitive)
                    if (isCodeField(mapEntry.key)) {
                        optionValue = variableCode;
                    } else {
                        const option = mapEntry.options.find((opt: any) => opt.code === variableCode);
                        optionValue = option ? option.value : null;

                        if (optionValue && replacementMap[mapEntry.key]) {
                            optionValue = replacementMap[mapEntry.key](optionValue);
                        }
                    }

                    convertedData[mapEntry.key] = optionValue;
                }
            } else {
                // For other types, just copy the value
                let transformedValue = value
                
                // Apply transformation if one exists for this key
                if (transformedValue && typeof transformedValue === 'string' && replacementMap[mapEntry.key]) {
                    transformedValue = replacementMap[mapEntry.key](transformedValue)
                }
                
                convertedData[mapEntry.key] = transformedValue
            }
        }

        // Loop through the group fields and create grouped arrays if necessary
        groupFields.forEach(groupField => {
            const groupEntries = Object.entries(convertedData).filter(([key, _]) => key.endsWith(groupField))
            if (groupEntries.length > 0) {
                const groupedValues = groupEntries
                    .map(([_, value]) => value)
                    .filter(value => value !== null && !(Array.isArray(value) && value.length === 0))
                    .flat()
                
                if (groupedValues.length > 0) {
                    convertedData[groupField] = groupedValues
                }
                
                // Delete the individual group entries after grouping
                groupEntries.forEach(([key, _]) => delete convertedData[key])
            }
        })

        // Combined single study-design value per study (a study is either
        // interventional or observational). Used by the study-design
        // visualisation and the Study Design filter.
        const studyDesign = convertedData['InterventionalStudyDesign'] || convertedData['ObservationalStudyDesign']
        if (studyDesign) {
            convertedData['StudyDesign'] = studyDesign
        }

        return convertedData
    })

    // Empty the data rrna folder
    fs.emptyDirSync('./data/dist/rrna')

    // Write the file to the data folder
    const pathname = './data/dist/rrna/studies.json'
    fs.writeJsonSync(pathname, rrnaData)

    // Write the file to the public folder
    const publicPathname = './public/data/rrna/studies.json'
    fs.ensureDirSync('./public/data/rrna')
    fs.writeJsonSync(publicPathname, rrnaData)

    printWrittenFileStats(pathname)
    
    return Promise.resolve(rrnaData)
}