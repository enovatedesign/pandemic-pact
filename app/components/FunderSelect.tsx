import {useState} from "react"
import Select, {type MultiValue} from "react-select"

import funders from '../../data/source/funders.json'

interface SelectOption {
    value: string,
    label: string,
}

interface Props {
    setSelectedFunders: (funders: string[]) => void,
}

export default function FunderSelect({setSelectedFunders}: Props) {
    const [selectedOptions, setSelectedOptions] = useState<MultiValue<SelectOption>>([])

    const options = funders.map((funderName: string) => ({
        value: funderName,
        label: funderName,
    }))

    const onChange = (options: MultiValue<SelectOption>) => {
        setSelectedOptions(options)
        setSelectedFunders(options.map((option: SelectOption) => option.value))
    }

    return (
        <Select
            instanceId="funders"
            value={selectedOptions}
            onChange={onChange}
            placeholder="Select funders..."
            options={options}
            className="text-black"
            isMulti
        />
    )
}
