import {useState} from "react"
import {MultiSelect, MultiSelectItem} from "@tremor/react"

import diseaseOptions from '../../data/dist/select-options/Diseases.json'

interface Props {
    setSelectedDiseases: (disease: string[]) => void,
    className?: string
}

export default function DiseaseSelect({setSelectedDiseases, className}: Props) {
    const [selectedOptions, setSelectedOptions] = useState<string[]>([])

    const onChange = (options: string[]) => {
        setSelectedOptions(options)
        setSelectedDiseases(options)
    }

    return (
        <MultiSelect
            value={selectedOptions}
            onValueChange={onChange}
            placeholder="All Diseases"
            className={className}
        >
            {diseaseOptions.map(diseaseOption => (
                <MultiSelectItem
                    key={diseaseOption.value}
                    value={diseaseOption.label}
                >
                    {diseaseOption.label}
                </MultiSelectItem>
            ))}
        </MultiSelect>
    )
}
