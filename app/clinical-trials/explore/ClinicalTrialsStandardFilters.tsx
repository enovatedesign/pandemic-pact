'use client'

import { useState } from 'react'

import MultiSelect from '../../components/MultiSelect'
import Select from '../../components/Select'
import CMSFilterBlock from '../../components/CMS/HierarchicalFiltersBlock'
import {
    availableClinicalTrialsFilters,
    pluralizeFilterLabel,
} from '../../helpers/filters'
import { CtStandardFilters, coLocatedFilterOptionsFor } from './search'

const OPTIONS_BASE_PATH = '/data/clinical-trials/select-options'

const COLOCATED_LOCATION_OPTIONS = coLocatedFilterOptionsFor('Research Location')
const COLOCATED_INSTITUTION_OPTIONS = coLocatedFilterOptionsFor('Research Institution')

interface Props {
    selectedFilters: CtStandardFilters
    setSelectedFilters: (filters: CtStandardFilters) => void
    coLocatedLocationFilter: string
    setCoLocatedLocationFilter: (coLocated: string) => void
    coLocatedInstitutionFilter: string
    setCoLocatedInstitutionFilter: (coLocated: string) => void
}

// Standard explore filters for clinical trials. The Family → Pathogen → Disease
// → Strain cascade is rendered by the shared HierarchicalFiltersBlock (the same
// component the grants explore page uses); the remaining fields are flat
// multi-selects driven by the non-advanced, non-hidden filter schema.
export default function ClinicalTrialsStandardFilters({
    selectedFilters,
    setSelectedFilters,
    coLocatedLocationFilter,
    setCoLocatedLocationFilter,
    coLocatedInstitutionFilter,
    setCoLocatedInstitutionFilter,
}: Props) {
    const fields = availableClinicalTrialsFilters().filter(
        f => !f.advanced && !f.isHidden,
    )

    const coLocatedOptionFor = (
        options: { value: string; label: string }[],
        value: string,
    ) => options.find(option => option.value === value) as {
        value: string
        label: string
    }

    // Fields that already have a value on first render (e.g. from a deep-link such
    // as the Viz 1 "Explore registrations" link). Their options are loaded eagerly
    // so the selected value's label shows immediately, rather than only after the
    // dropdown is focused. Snapshotted once to avoid re-fetching as filters change.
    const [eagerFields] = useState(
        () =>
            new Set(
                Object.entries(selectedFilters)
                    .filter(([, values]) => (values ?? []).length > 0)
                    .map(([field]) => field),
            ),
    )

    const setSelectedOptions = (field: string, selectedOptions: string[]) => {
        setSelectedFilters({
            ...selectedFilters,
            [field]: selectedOptions,
        })
    }

    // Adapter for the cascading hierarchy block: it hands back a map of
    // field -> { value } (Families/Pathogens/Diseases/Strains), which we flatten
    // into the CtStandardFilters shape (field -> string[]) in a single update.
    const setCMSSelectedOptions = (
        selectedCMSFilters: Record<string, { value: string | null }>,
    ) => {
        const processedFilters = Object.fromEntries(
            Object.entries(selectedCMSFilters).map(([key, option]) => {
                if (!option || typeof option !== 'object' || !('value' in option)) {
                    return [key, []]
                }
                return [key, option.value !== null ? [option.value] : []]
            }),
        )

        setSelectedFilters({
            ...selectedFilters,
            ...processedFilters,
        })
    }

    return (
        <section className="bg-white p-3">
            <h3 className="sr-only text-secondary uppercase tracking-widest text-xl font-bold">
                Standard Search
            </h3>

            <div className="divide-y-2 divide-gray-100">
                <div className="pb-4">
                    <p className="text-secondary pb-4">
                        Family, Pathogen and Disease filters
                    </p>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
                        <CMSFilterBlock
                            selectedFilters={selectedFilters}
                            setSelectedOptions={setCMSSelectedOptions}
                            isVisualisePage={false}
                        />
                    </div>
                </div>

                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {fields.map(({ field, label, isPlural }) => (
                    <MultiSelect
                        key={field}
                        field={field}
                        selectedOptions={selectedFilters[field] ?? []}
                        setSelectedOptions={selectedOptions =>
                            setSelectedOptions(field, selectedOptions)
                        }
                        label={pluralizeFilterLabel(label, isPlural)}
                        optionsBasePath={OPTIONS_BASE_PATH}
                        loadOnClick={!eagerFields.has(field)}
                        pruneUnknownValues={true}
                        className="col-span-1"
                    />
                ))}

                <Select
                    value={coLocatedOptionFor(COLOCATED_LOCATION_OPTIONS, coLocatedLocationFilter)}
                    options={COLOCATED_LOCATION_OPTIONS}
                    onChange={option => {
                        if (option === null) {
                            throw new Error(
                                'co-located select onChange received null for option when it should always have a value set',
                            )
                        }

                        setCoLocatedLocationFilter(option.value)
                    }}
                    label="Co-located by Research Location"
                    className="col-span-1"
                />

                <Select
                    value={coLocatedOptionFor(COLOCATED_INSTITUTION_OPTIONS, coLocatedInstitutionFilter)}
                    options={COLOCATED_INSTITUTION_OPTIONS}
                    onChange={option => {
                        if (option === null) {
                            throw new Error(
                                'co-located select onChange received null for option when it should always have a value set',
                            )
                        }

                        setCoLocatedInstitutionFilter(option.value)
                    }}
                    label="Co-located by Research Institution"
                    className="col-span-1"
                />
                </div>
            </div>
        </section>
    )
}
