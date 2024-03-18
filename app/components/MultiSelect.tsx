import { useId, useMemo, useState } from 'react'
import Select, { MultiValue } from 'react-select'

interface Option {
    label: string
    value: string
}

interface Props {
    field: string
    selectedOptions: string[]
    setSelectedOptions: (options: string[]) => void
    placeholder?: string
    className?: string
    preloadedOptions?: Option[]
    label?: string
}

export default function MultiSelect({
    field,
    selectedOptions,
    setSelectedOptions,
    className,
    preloadedOptions = [],
    label
}: Props) {
    const [options, setOptions] = useState<Option[]>(preloadedOptions)

    const [isLoading, setIsLoading] = useState<boolean>(false)

    const id = useId()

    const value: Option[] = useMemo(() => {
        return selectedOptions.map(option => {
            return options.find(o => o.value === option)
        }) as Option[]
    }, [selectedOptions, options])

    const onChange = (option: MultiValue<Option>) => {
        setSelectedOptions(option.map(o => o.value))
    }

    const loadOptions = () => {
        // If options are already loaded, don't load them again
        if (options.length > 0) {
            return options
        }

        setIsLoading(true)

        fetch(`/data/select-options/${field}.json`)
            .then(response => response.json())
            .then(data => {
                setOptions(data)
                setIsLoading(false)
            })
            .catch(error => {
                console.error('Error loading options:', error)
                setIsLoading(false)
            })
    }

    return (
        <Select
            isMulti
            options={options}
            onChange={onChange}
            value={value}
            placeholder={`All ${label}`}
            aria-label={`All ${label}`}
            className={`text-black ${className}`}
            instanceId={id}
            onFocus={loadOptions}
            isLoading={isLoading}
        />
    )
}
