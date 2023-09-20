import {MultiSelect as TremorMultiSelect, MultiSelectItem as TremorMultiSelectItem} from "@tremor/react"

interface Option {
    label: string,
    value: string,
}

interface Props {
    options: Option[],
    selectedOptions: string[]
    setSelectedOptions: (options: string[]) => void,
    placeholder?: string,
    className?: string,
}

export default function MultiSelect({options, selectedOptions, setSelectedOptions, placeholder, className}: Props) {
    const onChange = (options: string[]) => {
        setSelectedOptions(options)
    }

    return (
        <TremorMultiSelect
            value={selectedOptions}
            onValueChange={onChange}
            placeholder={placeholder ?? "All"}
            className={className}
        >
            {options.map(option => (
                <TremorMultiSelectItem
                    key={option.value}
                    value={option.value}
                >
                    {option.label}
                </TremorMultiSelectItem>
            ))}
        </TremorMultiSelect>
    )
}
