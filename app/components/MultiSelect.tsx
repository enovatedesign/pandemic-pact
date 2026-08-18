import { 
    useId, 
    useMemo, 
    useState, 
    useEffect, 
    useCallback,
} from 'react'
import Select, { MultiValue } from 'react-select'

import { customSelectThemeColours } from '../helpers/select-colours'
import { SelectOption } from '@/scripts/types/generate'

interface Props {
    field: string
    selectedOptions: string[]
    setSelectedOptions: (options: string[]) => void
    placeholder?: string
    className?: string
    preloadedOptions?: SelectOption[]
    label?: string
    fixedDiseaseOption?: {
        label: string
        value: string
        isFixed?: boolean
    } | null
    loadOnClick?: boolean
    /** Base path the per-field options JSON is fetched from. Defaults to the
     * grants location; clinical-trials passes its own directory. */
    optionsBasePath?: string
    /** When provided, the options are fully controlled by the parent (no fetch).
     * Used for cascading filters where one select's options depend on another. */
    controlledOptions?: SelectOption[]
}

export default function MultiSelect({
    field,
    selectedOptions,
    setSelectedOptions,
    className,
    preloadedOptions = [],
    label = '',
    loadOnClick = true,
    optionsBasePath = '/data/select-options',
    controlledOptions,
}: Props) {
    const [options, setOptions] = useState<SelectOption[]>(
        controlledOptions ?? preloadedOptions,
    )
    const [isLoading, setIsLoading] = useState<boolean>(false)

    // When the parent controls the options (cascading filters), mirror them and
    // skip all fetching.
    useEffect(() => {
        if (controlledOptions) {
            setOptions(controlledOptions)
        }
    }, [controlledOptions])

    const id = useId()

    const value: SelectOption[] = useMemo(() => {
        // Drop any selected values that aren't in the current options (e.g. a
        // stale or deep-linked filter value that no longer exists after a data
        // refresh). Without this, `find` returns undefined and react-select
        // receives undefined entries it can't render.
        return selectedOptions
            .map(option => options.find(o => o.value === option))
            .filter((o): o is SelectOption => o !== undefined)
    }, [selectedOptions, options])

    const onChange = (option: MultiValue<SelectOption>) => {
        setSelectedOptions(option.map(o => o.value))
    }

    const loadOptions = useCallback(async () => {
        if (controlledOptions) return

        const response = await fetch(`${optionsBasePath}/${field}.json`)

        if (!response.ok) {
            console.error('Error fetching data', response.statusText)
        } else {
            const data = await response.json()

            if (data) {
                setOptions(data)
                setIsLoading(false)
            }
        }

    }, [field, optionsBasePath, controlledOptions])

    const loadOptionsOnClick = () => {
        // Parent-controlled options never fetch.
        if (controlledOptions) {
            return
        }

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
