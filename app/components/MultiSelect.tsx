import { useId } from 'react'
import Select, { MultiValue } from 'react-select'

interface Option {
    label: string
    value: string
}

interface Props {
    options: Option[]
    selectedOptions: string[]
    setSelectedOptions: (options: string[]) => void
    placeholder?: string
    className?: string
}

export default function MultiSelect({
    options,
    selectedOptions,
    setSelectedOptions,
    placeholder,
    className,
}: Props) {
    const id = useId()

    const onChange = (option: MultiValue<Option>) => {
        setSelectedOptions(option.map(o => o.value))
    }

    return (
        <Select
            isMulti
            options={options}
            onChange={onChange}
            placeholder={placeholder ?? 'All'}
            className={`text-black ${className}`}
            instanceId={id}
        />
    )
}
