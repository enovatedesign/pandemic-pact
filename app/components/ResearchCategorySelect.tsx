import {useState} from "react"
import {MultiSelect, MultiSelectItem} from "@tremor/react"

import lookupTables from '../../data/source/lookup-tables.json'
import {StringDictionary} from "../../scripts/types/dictionary"
import {map} from 'lodash'

interface Props {
    setSelectedResearchCategories: (researchCategory: string[]) => void,
    className?: string
}

export default function ResearchCategorySelect({setSelectedResearchCategories, className}: Props) {
    const [selectedOptions, setSelectedOptions] = useState<string[]>([])

    const researchCategories = lookupTables.ResearchCat as StringDictionary

    const onChange = (options: string[]) => {
        setSelectedOptions(options)
        setSelectedResearchCategories(options)
    }

    return (
        <MultiSelect
            value={selectedOptions}
            onValueChange={onChange}
            placeholder="All Research Categories"
            className={className}
        >
            {map(researchCategories, (researchCategory, index) => (
                <MultiSelectItem key={`${index}-${researchCategory}`} value={researchCategory}>
                    {researchCategory}
                </MultiSelectItem>
            ))}
        </MultiSelect>
    )
}
