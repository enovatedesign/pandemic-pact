import MultiSelect from './MultiSelect'
import { SearchFilters } from '../helpers/search'
import selectOptions from '../../data/dist/select-options.json'

interface StandardSearchFiltersProps {
    searchFilters: SearchFilters
    setSearchFilters: any
}

export default function StandardSearchFilters({
    searchFilters,
    setSearchFilters,
}: StandardSearchFiltersProps) {
    const setSelectedOptions = (field: string, selectedOptions: string[]) => {
        setSearchFilters((previousSearchFilters: SearchFilters) => {
            // Find the index of the filter object with field
            const index = previousSearchFilters.filters.findIndex(
                filter => filter.field === field
            )

            if (index !== -1) {
                // If the filter object exists, update its values array
                return {
                    ...previousSearchFilters,
                    filters: [
                        ...previousSearchFilters.filters.slice(0, index),
                        {
                            ...previousSearchFilters.filters[index],
                            values: selectedOptions,
                        },
                        ...previousSearchFilters.filters.slice(index + 1),
                    ],
                }
            } else {
                // If the filter object doesn't exist, create a new one
                return {
                    ...previousSearchFilters,
                    filters: [
                        ...previousSearchFilters.filters,
                        {
                            field,
                            values: selectedOptions,
                            logicalAnd: false,
                        },
                    ],
                }
            }
        })
    }

    const fields = {
        Disease: 'Diseases',
        Pathogen: 'Pathogen Families',
        ResearchInstitutionCountry: 'Research Institution Countries',
        ResearchInstitutionRegion: 'Research Institution Regions',
        FunderCountry: 'Funder Countries',
        FunderRegion: 'Funder Regions',
        FundingOrgName: 'Funders',
    }

    return (
        <section className=" bg-white p-3">
            <h3 className="sr-only text-secondary uppercase tracking-widest text-xl font-bold">
                Standard Search
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(fields).map(([field, label]) => (
                    <StandardSearchMultiSelect
                        key={field}
                        field={field}
                        label={label}
                        searchFilters={searchFilters}
                        setSelectedOptions={setSelectedOptions}
                    />
                ))}
            </div>
        </section>
    )
}

interface StandardSearchMultiSelectProps {
    field: string
    label: string
    searchFilters: SearchFilters
    setSelectedOptions: any
}

function StandardSearchMultiSelect({
    field,
    label,
    searchFilters,
    setSelectedOptions,
}: StandardSearchMultiSelectProps) {
    const selectedOptions = searchFilters.filters.find(
        filter => filter.field === field
    )?.values

    return (
        <MultiSelect
            key={field}
            field={field}
            preloadedOptions={
                selectOptions[field as keyof typeof selectOptions]
            }
            selectedOptions={selectedOptions ?? []}
            setSelectedOptions={selectedOptions =>
                setSelectedOptions(field, selectedOptions)
            }
            placeholder={`All ${label}`}
            className="col-span-1"
        />
    )
}
