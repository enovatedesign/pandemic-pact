import { useId, useMemo, useState, useEffect } from 'react'
import Select, { MultiValue } from 'react-select'
import { customSelectThemeColours } from '../helpers/select-colours'

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
    fixedDiseaseOptions?: {
        label: string
        value: string
        isFixed?: boolean
    }[]
}

export default function MultiSelect({
    field,
    selectedOptions,
    setSelectedOptions,
    className,
    preloadedOptions = [],
    label = '',
    fixedDiseaseOptions
}: Props) {
    const [options, setOptions] = useState<Option[]>(preloadedOptions)
    
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const id = useId()

    const value = useMemo(() => {
        return [
            fixedDiseaseOptions && fixedDiseaseOptions[0],
            ...selectedOptions.map(option => {
                return options.find(o => o.value === option)
            })
        ]
    }, [selectedOptions, options, fixedDiseaseOptions]);
    
    useEffect(() => {
        if (
            fixedDiseaseOptions &&
            fixedDiseaseOptions.length > 0 &&
            JSON.stringify(selectedOptions) !== JSON.stringify(fixedDiseaseOptions.map(o => o.value))
        ) {
            setSelectedOptions(fixedDiseaseOptions.map(o => o.value));
        }
    }, [fixedDiseaseOptions, selectedOptions, setSelectedOptions]);

    const onChange = (newValue: MultiValue<Option | undefined>) => {
        if (fixedDiseaseOptions && fixedDiseaseOptions.length > 0) {
            return
        } else {
            setSelectedOptions(newValue.filter(o => o !== undefined).map(o => o!.value))
        }
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

    const fullLabel = label ? `All ${label}` : 'All'
    
    return (
        <Select
            isMulti
            options={options}
            onChange={onChange}
            value={value}
            placeholder={fullLabel}
            aria-label={fullLabel}
            className={`text-black ${className}`}
            instanceId={id}
            onFocus={loadOptions}
            isLoading={isLoading}
            theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  ...customSelectThemeColours,
                },
              })}
        />
    )
}
