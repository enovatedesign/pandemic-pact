import { useId, useMemo } from 'react'
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

    const defaultValue: Option[] = useMemo(() => {
        return selectedOptions.map(option => {
            return options.find(o => o.value === option)
        }) as Option[]
    }, [selectedOptions, options])

    const onChange = (option: MultiValue<Option>) => {
        setSelectedOptions(option.map(o => o.value))
    }

    return (
        <Select
            isMulti
            options={options}
            onChange={onChange}
            defaultValue={defaultValue}
            placeholder={placeholder ?? 'All'}
            className={`text-black ${className}`}
            instanceId={id}
        />
    )
}
