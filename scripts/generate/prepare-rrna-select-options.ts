import fs from 'fs-extra'
import { title, printWrittenFileStats } from '../helpers/log'

const toSnakeCase = (str: string) =>
    str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')

export default function prepareRrnaSelectOptions() {
    title('Generating RRNA select options')

    const rrnaData: any[] = fs.readJsonSync('./data/dist/rrna/studies.json')
    const rrnaDataDictionary: any[] = fs.readJsonSync('./data/download/rrna-data-dictionary.json')

    let rrnaSelectOptions: Record<string, any[]> = {
        "Pathogen Family": [],
        "Pathogen": [],
        "Disease": [],
        "Research Domain": [],
        "Study Country": [],
        "Study Type": [],
        "Study Design": [],
        "Study Population": [],
    }

    // Map of the select option keys to the corresponding keys in the RRNA data
    const selectOptionsMap = {
        "Pathogen Family": "Families",
        "Pathogen": "Pathogen",
        "Disease": "Diseases",
        "Research Domain": "Domains",
        "Study Country": "StudyCountry",
        "Study Type": "StudyTypeRrna",
        "Study Design": "StudyDesign",
        "Study Population": "AgeGroupsRrna",
    }

    const isCodeField = (key: string) =>
        ['Families', 'Pathogen', 'Diseases', 'StudyCountry'].some(group => key.endsWith(group));

    const isGroupField = (key: string) =>
        ['Pathogen', 'Diseases'].some(group => key === group);

    Object.entries(selectOptionsMap).forEach(([optionKey, dataKey]) => {
        // Collect all values for this field from all studies
        const allValues = rrnaData.flatMap(study => study[dataKey] || [])
        
        // Remove duplicates by converting to Set, then back to array
        const uniqueValues = Array.from(new Set(allValues)).filter(Boolean)
        
        rrnaSelectOptions[optionKey] = uniqueValues.map(value => {
            if (value === '_88') {
                return { label: 'Other', value: '-88' }
            }

            let selectLabel = value

            // If the field's value is a code, we need to look up the corresponding label from the data dictionary
            if (isCodeField(dataKey)) {
                /* 
                   The key needs to be reformated from title case to match the 
                   format of the field name in the data dictionary 
                   (e.g. "StudyCountry" to "study_country")
                */
                const dictionaryKey = toSnakeCase(dataKey)
                const dictionaryEntries = rrnaDataDictionary.filter(entry => entry['Variable / Field Name'] === dictionaryKey || entry['Variable / Field Name'].endsWith(`_${dictionaryKey}`))

                if (dictionaryEntries.length) {
                    for (const entry of dictionaryEntries) {
                        if (entry['Field Type'] === 'checkbox' || entry['Field Type'] === 'radio') {
                            const options = entry['Choices, Calculations, OR Slider Labels'].split(' | ').map((option: string) => {
                                // Split on the first comma only (labels may contain commas)
                                const separatorIndex = option.indexOf(',')
                                const code = option.slice(0, separatorIndex).trim()
                                const label = option.slice(separatorIndex + 1).trim()
                                return { code, label }
                            })

                            const matchingOption = options.find((option: { code: string; label: string }) => option.code === value)
                            if (matchingOption) {
                                selectLabel = matchingOption.label
                                break
                            }
                        }
                    }
                }
            }

            return {
                label: selectLabel,
                value: value
            }
        }).sort((a, b) => {
            if (a.label === 'Other') return 1
            if (b.label === 'Other') return -1
            return a.label.localeCompare(b.label)
        })
    })

    const pathname = './data/dist/rrna/select-options.json'

    fs.writeJsonSync(pathname, rrnaSelectOptions)

    printWrittenFileStats(pathname)
}