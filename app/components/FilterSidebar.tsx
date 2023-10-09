import {Button, Flex, Text, Subtitle} from "@tremor/react"
import MultiSelect from "./MultiSelect"
import {XIcon} from "@heroicons/react/solid"
import {type Filters} from "../types/filters"
import {emptyFilters} from "../helpers/filter"
import selectOptions from '../../data/dist/select-options.json'

interface FilterSidebarProps {
    selectedFilters: Filters,
    setSelectedFilters: (filters: Filters) => void,
    completeDataset: any[],
    globallyFilteredDataset: any[],
}

type FilterableField = keyof Filters

export default function FilterSidebar({selectedFilters, setSelectedFilters, completeDataset, globallyFilteredDataset}: FilterSidebarProps) {
    const filters: any = Object.entries({
        "FundingOrgName": "Funder",
        "ResearchInstitutionName": "Research Institution",
        "Disease": "Disease",
        "Pathogen": "Pathogen",
        "GrantStartYear": "Year",
        "StudySubject": "Study Subject",
        "AgeGroups": "Age Group",
        "StudyType": "Study Type",
    })

    const setSelectedOptions = (field: keyof Filters, options: string[]) => {
        let selectedOptions: Filters = {...selectedFilters}

        selectedOptions[field] = options

        setSelectedFilters(selectedOptions)
    }

    return (
        <Flex
            flexDirection="col"
            justifyContent="start"
            alignItems="start"
            className="gap-y-4"
        >
            <Subtitle className="text-white">{
                (globallyFilteredDataset.length < completeDataset.length) ?
                    `Filtered Grants: ${globallyFilteredDataset.length} / ${completeDataset.length}` :
                    `Total Grants: ${completeDataset.length}`
            }</Subtitle>

            {filters.map(([field, name]: [FilterableField, string]) => (
                <Flex
                    flexDirection="col"
                    justifyContent="start"
                    alignItems="start"
                    className="gap-y-2"
                    key={field}
                >
                    <Text className="text-white">Filter by {name}</Text>

                    <MultiSelect
                        options={selectOptions[field]}
                        selectedOptions={selectedFilters[field]}
                        setSelectedOptions={options => setSelectedOptions(field, options)}
                    />
                </Flex>
            ))}

            <Button
                onClick={() => setSelectedFilters(emptyFilters())}
                className="mt-4 self-end"
                icon={XIcon}
            >
                Clear All
            </Button>
        </Flex>
    )
}
