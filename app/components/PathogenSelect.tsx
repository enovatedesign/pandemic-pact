import {useState} from "react"
import {MultiSelect, MultiSelectItem} from "@tremor/react"

import pathogenOptions from '../../data/dist/select-options/Pathogens.json'

interface Props {
    setSelectedPathogens: (pathogen: string[]) => void,
    className?: string
}

export default function PathogenSelect({setSelectedPathogens, className}: Props) {
    const [selectedOptions, setSelectedOptions] = useState<string[]>([])

    const onChange = (options: string[]) => {
        setSelectedOptions(options)
        setSelectedPathogens(options)
    }

    return (
        <MultiSelect
            value={selectedOptions}
            onValueChange={onChange}
            placeholder="All Pathogens"
            className={className}
        >
            {pathogenOptions.map(pathogenOption => (
                <MultiSelectItem
                    key={pathogenOption.value}
                    value={pathogenOption.label}
                >
                    {pathogenOption.label}
                </MultiSelectItem>
            ))}
        </MultiSelect>
    )
}
