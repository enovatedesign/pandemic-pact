import { 
    useId, 
    useMemo, 
    useState, 
    useEffect, 
    useCallback,
} from 'react'
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
                isDisabled={false}
            />
        </>
    )
}
