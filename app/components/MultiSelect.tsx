import { 
    useId, 
    useMemo, 
    useState, 
    useEffect, 
    useCallback, 
    useContext 
} from 'react'
import Select, { MultiValue } from 'react-select'
import { FixedSelectOptionContext } from '../helpers/filters'
import { customSelectThemeColours } from '../helpers/select-colours'
import { Lalezar } from 'next/font/google'

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
    fixedDiseaseOption?: {
        label: string
        value: string
        isFixed?: boolean
    } | null
    loadOnClick?: boolean
}

export default function MultiSelect({
    field,
    selectedOptions,
    setSelectedOptions,
    className,
    preloadedOptions = [],
    label = '',
    loadOnClick = true,
}: Props) {
    const [options, setOptions] = useState<Option[]>(preloadedOptions)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const fixedSelectOptions = useContext(FixedSelectOptionContext)

    const id = useId()

    const value: Option[] = useMemo(() => {
        return selectedOptions.map(option => {
            return options.find(o => o.value === option)
        }) as Option[]
    }, [selectedOptions, options])

    const onChange = (option: MultiValue<Option>) => {
        setSelectedOptions(option.map(o => o.value))
    }

    const loadOptions = useCallback(async () => {
        const response = await fetch(`/data/select-options/${field}.json`)
        
        if (!response.ok) {
            console.error('Error fetching data', response.statusText)
        } else {
            const data = await response.json()
    
            if (data) {
                setOptions(data)
                setIsLoading(false)
            }
        }

    }, [field])

    const loadOptionsOnClick = () => {
        // If options are already loaded, don't load them again
        if (options.length > 0) {
            return
        }

        setIsLoading(true)

        loadOptions()
    }

    useEffect(() => {
        if (!loadOnClick) {
            loadOptions();
        }
    }, [loadOnClick, loadOptions])

    const fullLabel = label ? `All ${label}` : 'All'
    
    let disabled = false

    // If the fixed select option contains data, for each field within the fixedSelectOptions we will ensure 
    // the corresponding filter is being disabled using the label provided in the filters array.
    if (fixedSelectOptions) {
        let formattedLabel = label

        if (label === 'Pathogen' && (fixedSelectOptions && fixedSelectOptions.Families?.label)) {
            formattedLabel = `${fixedSelectOptions.Families.label}Pathogen`
        }

        if (label === 'Family') {
            formattedLabel = "Families"
        }
        
        const labelIsInFixedOptions = Object.keys(fixedSelectOptions).includes(formattedLabel)
        const fixedOptionValue = fixedSelectOptions[formattedLabel as keyof typeof fixedSelectOptions]?.value ?? ''
        
        if (labelIsInFixedOptions && fixedOptionValue) {
            disabled = fixedOptionValue !== ''
        }
    }

    return (
        <>
            <Select
                isMulti
                options={options}
                onChange={onChange}
                value={value}
                placeholder={fullLabel}
                aria-label={fullLabel}
                className={`text-black ${className}`}
                instanceId={id}
                onFocus={loadOnClick ? loadOptionsOnClick : () => null}
                isLoading={isLoading}
                theme={theme => ({
                    ...theme,
                    colors: {
                        ...theme.colors,
                        ...customSelectThemeColours,
                    },
                })}
                isDisabled={disabled}
            />
        </>
    )
}
