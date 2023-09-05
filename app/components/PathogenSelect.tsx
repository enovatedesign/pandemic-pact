import {useState} from "react"
import {MultiSelect, MultiSelectItem} from "@tremor/react"

import lookupTables from '../../data/source/lookup-tables.json'
import {StringDictionary} from "../../scripts/types/dictionary"
import {map} from 'lodash'

interface Props {
    setSelectedPathogens: (pathogen: string[]) => void,
    className?: string
}

export default function PathogenSelect({setSelectedPathogens, className}: Props) {
    const [selectedOptions, setSelectedOptions] = useState<string[]>([])

    const pathogens = lookupTables.Pathogens as StringDictionary

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
            {map(pathogens, (pathogen, index) => (
                <MultiSelectItem key={`${index}-${pathogen}`} value={pathogen}>
                    {pathogen}
                </MultiSelectItem>
            ))}
        </MultiSelect>
    )
}
