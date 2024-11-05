import {
    SelectedStandardSearchFilters,
    jointFundingFilterOptions,
} from '../helpers/search'
import Select from './Select'
import MultiSelect from './MultiSelect'
import selectOptions from '../../data/dist/select-options.json'

interface Props {
    selectedFilters: SelectedStandardSearchFilters
    setSelectedFilters: (searchFilters: SelectedStandardSearchFilters) => void
    jointFundingFilter: string
    setJointFundingFilter: (jointFundingFilter: string) => void
}

export default function StandardSearchFilters({
    selectedFilters,
    setSelectedFilters,
    jointFundingFilter,
    setJointFundingFilter,
}: Props) {
    const setSelectedOptions = (field: string, selectedOptions: string[]) => {
        const newFilters = {
            ...selectedFilters,
            [field]: selectedOptions,
        }

        setSelectedFilters(newFilters)
    }

    const fields = {
        Disease: 'Diseases',
        Pathogen: 'Pathogen Families',
        ResearchInstitutionCountry: 'Research Institution Countries',
        ResearchInstitutionRegion: 'Research Institution Regions',
        FunderCountry: 'Funder Countries',
        FunderRegion: 'Funder Regions',
        FundingOrgName: 'Funders',
        ResearchCat: 'Research Categories'
    }

    const jointFundingValue = jointFundingFilterOptions.find(
        option => option.value === jointFundingFilter,
    ) as { value: string; label: string }

    return (
        <section className=" bg-white p-3">
            <h3 className="sr-only text-secondary uppercase tracking-widest text-xl font-bold">
                Standard Search
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(fields).map(([field, label]) => (
                    <MultiSelect
                        key={field}
                        field={field}
                        preloadedOptions={
                            selectOptions[field as keyof typeof selectOptions]
                        }
                        selectedOptions={
                            selectedFilters[
                                field as keyof SelectedStandardSearchFilters
                            ] ?? []
                        }
                        setSelectedOptions={selectedOptions =>
                            setSelectedOptions(field, selectedOptions)
                        }
                        label={label}
                        className="col-span-1"
                    />
                ))}

                <Select
                    value={jointFundingValue}
                    options={jointFundingFilterOptions}
                    onChange={option => {
                        if (option === null) {
                            throw new Error(
                                'joint funding select onChange received null for option when it should always have a value set',
                            )
                        }

                        setJointFundingFilter(option.value)
                    }}
                    label="Joint Funding Status"
                    className="col-span-1"
                />
            </div>
        </section>
    )
}
