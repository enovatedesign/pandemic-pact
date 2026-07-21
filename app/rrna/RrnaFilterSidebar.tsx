import React, { useMemo } from 'react'
import Select from 'react-select'

import rrnaSelectOptions from '@/data/dist/rrna/select-options.json'
import selectOptions from '@/data/dist/select-options.json'
import rrnaHierarchyFilters from '@/public/manual-rrna-hierarchy-filters.json'
import regionToCountryMapping from '@/data/source/region-to-country-mapping.json'

import LoadingSpinner from '@/app/components/LoadingSpinner'
import { customSelectThemeColours } from '@/app/helpers/select-colours'
import Switch from '@/app/components/Switch'
import CMSFilterBlock from '@/app/components/CMS/HierarchicalFiltersBlock'
import InfoModal from '@/app/components/InfoModal'
import { RRNA_DOMAIN_ORDER, orderByReference } from '@/app/helpers/rrnaConstants'

interface Option {
    label: string;
    value: string;
}

const VALID_REGION_IDS = new Set(Object.keys(regionToCountryMapping))

const whoRegionOptions = (selectOptions.ResearchInstitutionRegion as Option[])
    .filter(opt => VALID_REGION_IDS.has(opt.value))

// The RRNA dashboard shows one pathogen family at a time and defaults to
// Arenaviridae. The default is applied to selectedFilters in the page; here it
// seeds the hierarchical filter block's own display state.
const arenaviridae = (rrnaSelectOptions['Pathogen Family'] as Option[])
    .find(family => family.label === 'Arenaviridae')

const defaultFixedSelectOptions = arenaviridae
    ? {
        Families: { label: arenaviridae.label, value: arenaviridae.value },
        Pathogens: { label: '', value: null },
        Diseases: { label: '', value: null },
        Strains: { label: '', value: null },
    }
    : undefined

const selectTheme = (theme: any) => ({
    ...theme,
    colors: {
        ...theme.colors,
        ...customSelectThemeColours,
    },
})

interface RrnafilterSidebarProps {
    selectedFilters: Record<string, string[]>
    setSelectedFilters: React.Dispatch<React.SetStateAction<any>>
    completeDataset: any[]
    globallyFilteredDataset: any[]
    loadingDataset?: boolean
    excludeStudiesWithMultipleCountries: boolean,
    setExcludeStudiesWithMultipleCountries: (state: boolean) => void
    selectedRegions: string[]
    setSelectedRegions: (regions: string[]) => void
}

const hierarchyKeyMap: Record<string, string> = {
    'Families': 'Pathogen Family',
    'Pathogens': 'Pathogen',
    'Diseases': 'Disease',
}

const RrnaFilterSidebar = ({
    selectedFilters,
    setSelectedFilters,
    completeDataset,
    globallyFilteredDataset,
    loadingDataset,
    excludeStudiesWithMultipleCountries,
    setExcludeStudiesWithMultipleCountries,
    selectedRegions,
    setSelectedRegions,
}: RrnafilterSidebarProps) => {
    const filters = rrnaSelectOptions

    // Family / Pathogen / Disease cascade resets (on change and on clear) are
    // handled by the shared HierarchicalFiltersBlock, so this just maps the
    // block's field names onto the RRNA filter keys.
    const setSelectedOptions = (key: string, options: string[]) => {
        const mappedKey = hierarchyKeyMap[key] ?? key

        setSelectedFilters((prev: any) => ({
            ...prev,
            [mappedKey]: options,
        }))
    }

    return (
        <div className="flex flex-col items-start justify-start gap-y-4">
            <div className="text-white w-full p-4 rounded-xl bg-gradient-to-l from-primary/20 shadow-[inset_0_0_10px_rgba(98,213,209,0.25)] flex justify-between items-start gap-2">
                <p className="flex flex-col gap-1">
                    {loadingDataset ? (
                        <>
                            <span className="text-xs font-bold text-gray-300 uppercase">
                                Loading Dataset
                            </span>
                            <LoadingSpinner className="size-9 animate-spin shrink-0 text-primary" />
                        </>
                    ) : (
                        <>
                            {globallyFilteredDataset.length <
                            completeDataset.length ? (
                                <>
                                    <span className="text-xs font-bold text-gray-300 uppercase">
                                        Filtered Studies Total
                                    </span>
                                    <span className="flex flex-row items-end gap-1">
                                        <span className="text-4xl font-bold text-primary">
                                            {globallyFilteredDataset.length}
                                        </span>
                                        <span className="text-lg font-bold text-primary">
                                            {' '}
                                            / {completeDataset.length}
                                        </span>
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="text-xs font-bold text-gray-300 uppercase">
                                        Total Number Of Studies
                                    </span>
                                    <span className="text-4xl font-bold text-primary">
                                        {completeDataset.length.toLocaleString()}
                                    </span>
                                </>
                            )}
                        </>
                    )}
                </p>

                <InfoModal
                    customButtonClasses="shrink-0"
                    iconColour="text-primary"
                >
                    <p>
                        Filter preset to show one pathogen family at a time.
                        Please refer to headline text on this page for an
                        explanation of RRNA methodology.
                    </p>
                </InfoModal>
            </div>

            <CMSFilterBlock
                hierarchyFilters={rrnaHierarchyFilters as any}
                selectedFilters={selectedFilters}
                setSelectedOptions={setSelectedOptions}
                fixedSelectOptions={defaultFixedSelectOptions as any}
            />

            <RrnaFilterBlock
                filters={filters}
                setSelectedOptions={setSelectedOptions}
                excludeStudiesWithMultipleCountries={excludeStudiesWithMultipleCountries}
                setExcludeStudiesWithMultipleCountries={setExcludeStudiesWithMultipleCountries}
                selectedRegions={selectedRegions}
                setSelectedRegions={setSelectedRegions}
            />
        </div>
    )
}

export default RrnaFilterSidebar

interface filterBlockProps {
    filters: Record<string, Option[]>
    setSelectedOptions: (field: string, options: string[]) => void
    excludeStudiesWithMultipleCountries: boolean,
    setExcludeStudiesWithMultipleCountries: (state: boolean) => void
    selectedRegions: string[]
    setSelectedRegions: (regions: string[]) => void
}

// Family / Pathogen / Disease are handled by the hierarchical filter block
// above; Study Design is intentionally not exposed as a filter menu.
const hierarchyHandledKeys = ['Pathogen Family', 'Pathogen', 'Disease', 'Study Design']

const RrnaFilterBlock = ({
    filters,
    setSelectedOptions,
    excludeStudiesWithMultipleCountries,
    setExcludeStudiesWithMultipleCountries,
    selectedRegions,
    setSelectedRegions,
}: filterBlockProps) => Object.entries(filters)
    .filter(([key]) => !hierarchyHandledKeys.includes(key))
    .map(([key, options]) => {
        if (key === 'Study Country') {
            return (
                <div className="flex flex-col space-y-2 w-full" key={key}>
                    <p className="text-white">Filter by Region</p>
                    <Select
                        isMulti
                        options={whoRegionOptions}
                        value={whoRegionOptions.filter(opt => selectedRegions.includes(opt.value))}
                        onChange={(opts) => setSelectedRegions(opts.map(o => o.value))}
                        getOptionLabel={(option) => option.label}
                        getOptionValue={(option) => option.value}
                        aria-label="WHO Region"
                        placeholder="Select Region"
                        className="text-black"
                        theme={selectTheme}
                    />
                    <p className="text-white">Filter by Country</p>
                    <Select
                        isMulti
                        options={options}
                        onChange={(options) => setSelectedOptions(key, options.map(o => o.value))}
                        getOptionLabel={(option) => option.label}
                        getOptionValue={(option) => option.value}
                        aria-label={key}
                        placeholder="Select Country"
                        className="text-black"
                        theme={selectTheme}
                    />
                    <div>
                        <Switch
                            checked={excludeStudiesWithMultipleCountries}
                            onChange={() =>
                                setExcludeStudiesWithMultipleCountries(!excludeStudiesWithMultipleCountries)
                            }
                            label={'Exclude articles with multiple countries'}
                            textClassName="text-white"
                        />
                    </div>
                </div>
            )
        }

        let filteredOptions = options

        // Research Domains follow the protocol order from the RRNA Technical
        // Specification rather than the alphabetical order of the select options.
        if (key === 'Research Domain') {
            const orderedLabels = orderByReference(
                filteredOptions.map(option => option.label),
                RRNA_DOMAIN_ORDER,
            )

            filteredOptions = orderedLabels
                .map(label => filteredOptions.find(option => option.label === label))
                .filter((option): option is Option => Boolean(option))
        }

        return (
            <div className="flex flex-col space-y-2 w-full" key={key}>
                <p className="text-white">Filter by {key}</p>
                <Select
                    isMulti
                    options={filteredOptions}
                    onChange={(options) => setSelectedOptions(key, options.map(o => o.value))}
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => option.value}
                    aria-label={key}
                    placeholder={`Select ${key}`}
                    className="text-black"
                    theme={selectTheme}
                />
            </div>
        )
    })
