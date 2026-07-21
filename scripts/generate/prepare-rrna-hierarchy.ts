import fs from 'fs-extra'
import { title, info, printWrittenFileStats } from '../helpers/log'

/*
   DISABLED — this script is intentionally NOT called from the generate pipeline
   (see scripts/generate/index.ts). The RRNA filter hierarchy
   (public/manual-rrna-hierarchy-filters.json) is now maintained by hand so its
   curated (non-alphabetical) ordering is preserved. Running this script again
   would overwrite that file and revert it to alphabetical order, so do NOT
   re-enable it unless you deliberately want to regenerate from the RRNA data.

   Builds the Family → Pathogen → Disease hierarchy used by the RRNA filter
   sidebar (consumed by the shared HierarchicalFiltersBlock / CMSFilterBlock).

   The RRNA dataset codes families, pathogens and diseases with SNOMED codes, so
   the hierarchy is built directly from the RRNA data (not the ICTV funding-
   tracker hierarchy). Only families/pathogens/diseases that actually appear in
   the RRNA data are included.

   REDCap records diseases at the family level, so a study can list several
   co-occurring diseases (e.g. a St. Louis encephalitis study that also mentions
   related flaviviruses). Nesting a disease under every co-occurring pathogen
   gives incorrect parent/child relationships. Instead each disease is nested
   under its DOMINANT pathogen — the pathogen it co-occurs with most often —
   which resolves to the correct taxonomic (eponymous) pairing.
*/

interface Option { label: string; value: string }

const EXCLUDED_CODES = new Set(['-88', '_88', '-99', '-9999'])
const EXCLUDED_LABELS = new Set(['Other', 'Unspecified', 'Not reported', 'Not Applicable'])

const isExcluded = (code: string, label?: string) =>
    EXCLUDED_CODES.has(code) || (label !== undefined && EXCLUDED_LABELS.has(label))

export default function prepareRrnaHierarchy() {
    title('Generating RRNA filter hierarchy')

    const studies: any[] = fs.readJsonSync('./data/dist/rrna/studies.json')
    const selectOptions: Record<string, Option[]> = fs.readJsonSync('./data/dist/rrna/select-options.json')

    const familyOptions = selectOptions['Pathogen Family'] || []
    const pathogenLabel = new Map((selectOptions['Pathogen'] || []).map(o => [o.value, o.label]))
    const diseaseLabel = new Map((selectOptions['Disease'] || []).map(o => [o.value, o.label]))

    // Strains are nested under diseases (e.g. the Ebola disease strains) but are
    // not a top-level select option, so their labels are read directly from the
    // RRNA data dictionary's {family}_diseases_strains checkbox fields.
    const dataDictionary: any[] = fs.readJsonSync('./data/download/rrna-data-dictionary.json')
    const strainLabel = new Map<string, string>()
    for (const entry of dataDictionary) {
        const name: string = entry['Variable / Field Name'] || ''
        if (!/strains$/i.test(name)) continue
        const choices: string = entry['Choices, Calculations, OR Slider Labels'] || ''
        for (const option of choices.split(' | ')) {
            const separatorIndex = option.indexOf(',')
            if (separatorIndex === -1) continue
            const code = option.slice(0, separatorIndex).trim()
            const label = option.slice(separatorIndex + 1).trim()
            if (code && label) strainLabel.set(code, label)
        }
    }

    const hierarchy = familyOptions.map(family => {
        const familyRef = { label: family.label, value: family.value }

        const familyStudies = studies.filter(study =>
            Array.isArray(study.Families) && study.Families.includes(family.value)
        )

        const pathogenCodes = Array.from(new Set(familyStudies.flatMap(s => s.Pathogen || [])))
            .filter(code => pathogenLabel.has(code) && !isExcluded(code, pathogenLabel.get(code)))

        const diseaseCodes = Array.from(new Set(familyStudies.flatMap(s => s.Diseases || [])))
            .filter(code => diseaseLabel.has(code) && !isExcluded(code, diseaseLabel.get(code)))

        // Assign each disease to the pathogen it co-occurs with most often.
        const diseaseToPathogen: Record<string, string> = {}
        for (const disease of diseaseCodes) {
            const counts: Record<string, number> = {}
            for (const study of familyStudies) {
                if (!(study.Diseases || []).includes(disease)) continue
                for (const pathogen of (study.Pathogen || [])) {
                    if (pathogenCodes.includes(pathogen)) {
                        counts[pathogen] = (counts[pathogen] || 0) + 1
                    }
                }
            }
            const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
            if (dominant) {
                diseaseToPathogen[disease] = dominant[0]
            }
        }

        const strainCodes = Array.from(new Set(familyStudies.flatMap(s => s.Strains || [])))
            .filter(code => strainLabel.has(code) && !isExcluded(code, strainLabel.get(code)))

        // Assign each strain to the disease it co-occurs with most often.
        const strainToDisease: Record<string, string> = {}
        for (const strain of strainCodes) {
            const counts: Record<string, number> = {}
            for (const study of familyStudies) {
                if (!(study.Strains || []).includes(strain)) continue
                for (const disease of (study.Diseases || [])) {
                    if (diseaseCodes.includes(disease)) {
                        counts[disease] = (counts[disease] || 0) + 1
                    }
                }
            }
            const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
            if (dominant) {
                strainToDisease[strain] = dominant[0]
            }
        }

        const pathogens = pathogenCodes
            .map(pathogenCode => {
                const pathogenRef = {
                    label: pathogenLabel.get(pathogenCode) as string,
                    value: pathogenCode,
                    family: familyRef,
                }

                const diseases = diseaseCodes
                    .filter(diseaseCode => diseaseToPathogen[diseaseCode] === pathogenCode)
                    .map(diseaseCode => {
                        const diseaseRef = {
                            label: diseaseLabel.get(diseaseCode) as string,
                            value: diseaseCode,
                            pathogen: pathogenRef,
                        }

                        const strains = strainCodes
                            .filter(strainCode => strainToDisease[strainCode] === diseaseCode)
                            .map(strainCode => ({
                                label: strainLabel.get(strainCode) as string,
                                value: strainCode,
                                disease: diseaseRef,
                            }))
                            .sort((a, b) => a.label.localeCompare(b.label))

                        return { ...diseaseRef, strains }
                    })
                    .sort((a, b) => a.label.localeCompare(b.label))

                return { ...pathogenRef, diseases }
            })
            .filter(pathogen => pathogen.diseases.length > 0)
            .sort((a, b) => a.label.localeCompare(b.label))

        return { label: family.label, value: family.value, pathogens }
    })
    .filter(family => family.pathogens.length > 0)
    .sort((a, b) => a.label.localeCompare(b.label))

    const pathname = './public/manual-rrna-hierarchy-filters.json'
    fs.writeJsonSync(pathname, hierarchy)

    info(`Built RRNA hierarchy for ${hierarchy.length} families`)
    printWrittenFileStats(pathname)
}
