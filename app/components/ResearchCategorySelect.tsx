import {useState} from "react"
import {MultiSelect, MultiSelectItem} from "@tremor/react"

import researchCategoryOptions from '../../data/dist/select-options/ResearchCat.json'

interface Props {
    setSelectedResearchCategories: (researchCategory: string[]) => void,
    className?: string
}

export default function ResearchCategorySelect({setSelectedResearchCategories, className}: Props) {
    const [selectedOptions, setSelectedOptions] = useState<string[]>([])

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
            {researchCategoryOptions.map(researchCategoryOption => (
                <MultiSelectItem
                    key={researchCategoryOption.value}
                    value={researchCategoryOption.label}
                >
                    {researchCategoryOption.label}
                </MultiSelectItem>
            ))}
        </MultiSelect>
    )
}
