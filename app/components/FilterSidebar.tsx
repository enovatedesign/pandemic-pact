import {useState} from "react"
import {XIcon, ChevronUpIcon, ChevronDownIcon} from "@heroicons/react/solid"
import MultiSelect from "./MultiSelect"
import Switch from './Switch'
import Button from './Button'
import {type Filters} from "../types/filters"
import {availableFilters, emptyFilters} from "../helpers/filter"
import selectOptions from '../../data/dist/select-options.json'
import AnimateHeight from "react-animate-height"

interface FilterSidebarProps {
    selectedFilters: Filters,
    setSelectedFilters: (filters: Filters) => void,
    completeDataset: any[],
    globallyFilteredDataset: any[],
}

export default function FilterSidebar({selectedFilters, setSelectedFilters, completeDataset, globallyFilteredDataset}: FilterSidebarProps) {
    const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false)

    const filters = availableFilters()
    const standardFilters = filters.filter(f => !f.advanced)
    const advancedFilters = filters.filter(f => f.advanced)

    const setSelectedOptions = (field: keyof Filters, options: string[]) => {
        let selectedOptions: Filters = {...selectedFilters}

        selectedOptions[field].values = options

        setSelectedFilters(selectedOptions)
    }

    const setExcludeGrantsWithMultipleItemsInField = (field: keyof Filters, value: boolean) => {
        let selectedOptions: Filters = {...selectedFilters}

        selectedOptions[field].excludeGrantsWithMultipleItems = value

        setSelectedFilters(selectedOptions)
    }

    return (
        <div className="flex flex-col items-start justify-start gap-y-4">

            <div className="text-white w-full p-4 rounded-xl bg-gradient-to-l from-primary/20 shadow-[inset_0_0_10px_rgba(98,213,209,0.25)]">

                <p className="flex flex-col gap-1">
                    {
                        (globallyFilteredDataset.length < completeDataset.length) ? (
                            <>
                                <span className="text-xs font-bold text-gray-300 uppercase">Filtered Grants Total</span>
                                <span className="flex flex-row items-end gap-1">
                                    <span className="text-4xl font-bold text-primary">{globallyFilteredDataset.length}</span>
                                    <span className="text-lg font-bold text-primary"> / {completeDataset.length}</span>
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="text-xs font-bold text-gray-300 uppercase">Total Number Of Grants</span>
                                <span className="text-4xl font-bold text-primary">{completeDataset.length}</span>
                            </>
                        )
                    }
                </p>
            </div>
            

            <FilterBlock 
                filters={standardFilters} 
                selectedFilters={selectedFilters} 
                setExcludeGrantsWithMultipleItemsInField={setExcludeGrantsWithMultipleItemsInField} 
                setSelectedOptions={setSelectedOptions}
            />

            <AnimateHeight
                duration={300}
                height={showAdvancedFilters ? 'auto' : 0}
                className="w-full"
            >   
                <div className="flex flex-col items-start justify-start gap-y-4">
                    <FilterBlock 
                        filters={advancedFilters} 
                        selectedFilters={selectedFilters} 
                        setExcludeGrantsWithMultipleItemsInField={setExcludeGrantsWithMultipleItemsInField} 
                        setSelectedOptions={setSelectedOptions}
                    />
                </div>
            </AnimateHeight>

            <div className="flex items-center justify-between w-full">
                <Button
                    size="xsmall"
                    customClasses="mt-3 flex items-center gap-1"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                    {showAdvancedFilters ? (
                        <>Hide Advanced <ChevronUpIcon className="w-5 h-5" /></>
                    ) : (
                        <>Show Advanced <ChevronDownIcon className="w-5 h-5" /></>
                    )}
                </Button>

                <Button
                    size="xsmall"
                    customClasses="mt-3 flex items-center gap-1"
                    onClick={() => setSelectedFilters(emptyFilters())}
                >
                    Clear All <XIcon className="w-5 h-5" />
                </Button>
            </div>
        </div>
    )
}


interface filterBlockProps {
    filters: {
        field: string, 
        label: string,
        advanced?: boolean,
        excludeGrantsWithMultipleItems?: { label: string },
    }[],   
    selectedFilters: Filters,
    setSelectedOptions: (field: keyof Filters, options: string[]) => void,
    setExcludeGrantsWithMultipleItemsInField: (field: keyof Filters, value: boolean) => void
}

const FilterBlock = ({filters, selectedFilters, setExcludeGrantsWithMultipleItemsInField, setSelectedOptions} : filterBlockProps) => {

    return (
        <>
            {filters.map(({field, label, excludeGrantsWithMultipleItems}) => (
                <div className="flex flex-col space-y-2 w-full" key={field}>
                    <p className="text-white">Filter by {label}</p>

                    <MultiSelect
                        options={selectOptions[field as keyof typeof selectOptions]}
                        selectedOptions={selectedFilters[field].values}
                        setSelectedOptions={options => setSelectedOptions(field, options)}
                    />

                    {excludeGrantsWithMultipleItems &&
                        <Switch
                            checked={selectedFilters[field].excludeGrantsWithMultipleItems}
                            onChange={value => setExcludeGrantsWithMultipleItemsInField(field, value)}
                            label={excludeGrantsWithMultipleItems.label}
                            textClassName="text-white"
                        />
                    }
                </div>
            ))}
        </>
    )
}