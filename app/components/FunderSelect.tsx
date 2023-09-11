import {useState} from "react"
import {MultiSelect, MultiSelectItem} from "@tremor/react"

import funderOptions from '../../data/dist/select-options/Funders.json'

interface Props {
    setSelectedFunders: (funder: string[]) => void,
}

export default function FunderSelect({setSelectedFunders}: Props) {
    const [selectedOptions, setSelectedOptions] = useState<string[]>([])

    const onChange = (options: string[]) => {
        setSelectedOptions(options)
        setSelectedFunders(options)
    }

    return (
        <MultiSelect
            value={selectedOptions}
            onValueChange={onChange}
            placeholder="All"
        >
            {funderOptions.map(funderOption => (
                <MultiSelectItem
                    key={funderOption.value}
                    value={funderOption.label}
                >
                    {funderOption.label}
                </MultiSelectItem>
            ))}
        </MultiSelect>
    )
}
