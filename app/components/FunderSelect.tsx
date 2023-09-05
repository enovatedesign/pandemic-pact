import {useState} from "react"
import {MultiSelect, MultiSelectItem} from "@tremor/react"

import funders from '../../data/source/funders.json'

interface Props {
    setSelectedFunders: (funders: string[]) => void,
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
            placeholder="Select funders..."
        >
            {funders.map((funder, index) => (
                <MultiSelectItem key={`${index}-${funder}`} value={funder}>
                    {funder}
                </MultiSelectItem>
            ))}
        </MultiSelect>
    )
}
