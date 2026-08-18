'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { XIcon, InformationCircleIcon } from '@heroicons/react/solid'

import MultiSelect from '../../components/MultiSelect'
import Switch from '../../components/Switch'
import Button from '../../components/Button'
import LoadingSpinner from '../../components/LoadingSpinner'
import CMSFilterBlock from '../../components/CMS/HierarchicalFiltersBlock'
import ClinicalTrialsCoverageInfoModal from '../ClinicalTrialsCoverageInfoModal'
import {
    Filters,
    FilterSchema,
    availableClinicalTrialsFilters,
    emptyClinicalTrialsFilters,
    pluralizeFilterLabel,
} from '../../helpers/filters'

const OPTIONS_BASE_PATH = '/data/clinical-trials/select-options'

interface Props {
    selectedFilters: Filters
    setSelectedFilters: (filters: Filters) => void
    completeDataset: any[]
    globallyFilteredDataset: any[]
    loadingDataset?: boolean
    excludeLinkedTrials: boolean
    setExcludeLinkedTrials: (value: boolean) => void
}

export default function ClinicalTrialsFilterSidebar({
    selectedFilters,
    setSelectedFilters,
    completeDataset,
    globallyFilteredDataset,
    loadingDataset = false,
    excludeLinkedTrials,
    setExcludeLinkedTrials,
}: Props) {
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [linkedInfoOpen, setLinkedInfoOpen] = useState(false)

    const filters = availableClinicalTrialsFilters()
    // Family/Pathogen/Disease/Strain (isHidden) are rendered by the shared
    // cascading HierarchicalFiltersBlock, not as flat multi-selects.
    const standardFilters = filters.filter(f => !f.advanced && !f.isHidden)
    const advancedFilters = filters.filter(f => f.advanced)

    // Mirrors the grants FilterSidebar: shallow-copy the filters object but keep
    // each field's nested object reference, then mutate its `values`. This is what
    // lets the cascade block fire several synchronous setSelectedOptions calls
    // (Families/Pathogens/Diseases/Strains) without each one clobbering the last.
    const setSelectedOptions = (field: string, options: string[]) => {
        const selectedOptions: Filters = { ...selectedFilters }

        if (!selectedOptions[field]) {
            selectedOptions[field] = {
                values: [],
                excludeGrantsWithMultipleItems: false,
            }
        }

        selectedOptions[field].values = options

        setSelectedFilters(selectedOptions)
    }

    const renderFilter = (filter: FilterSchema) => {
        const { field, label, isPlural } = filter
        const pluralLabel = pluralizeFilterLabel(label, isPlural)

        return (
            <div className="w-full" key={field}>
                <div className="flex flex-col space-y-2 w-full">
                    <p className="text-white">Filter by {pluralLabel}</p>

                    <MultiSelect
                        field={field}
                        selectedOptions={selectedFilters[field]?.values ?? []}
                        setSelectedOptions={options => setSelectedOptions(field, options)}
                        label={pluralLabel}
                        optionsBasePath={OPTIONS_BASE_PATH}
                    />

                    {field === 'Register' && (
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={excludeLinkedTrials}
                                onChange={setExcludeLinkedTrials}
                                label="Exclude linked trials"
                                textClassName="text-white"
                            />
                            <button
                                type="button"
                                onClick={() => setLinkedInfoOpen(true)}
                                className="text-primary hover:text-white transition-colors"
                                aria-label="What are linked trials?"
                            >
                                <InformationCircleIcon className="size-5" aria-hidden="true" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )
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
                    ) : globallyFilteredDataset.length < completeDataset.length ? (
                        <>
                            <span className="text-xs font-bold text-gray-300 uppercase">
                                Filtered Registrations Total
                            </span>
                            <span className="flex flex-row items-end gap-1">
                                <span className="text-4xl font-bold text-primary">
                                    {globallyFilteredDataset.length.toLocaleString()}
                                </span>
                                <span className="text-lg font-bold text-primary">
                                    {' '}/ {completeDataset.length.toLocaleString()}
                                </span>
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="text-xs font-bold text-gray-300 uppercase">
                                Total Number Of Registrations
                            </span>
                            <span className="text-4xl font-bold text-primary">
                                {completeDataset.length.toLocaleString()}
                            </span>
                        </>
                    )}
                </p>

                <ClinicalTrialsCoverageInfoModal customButtonClasses="shrink-0" />
            </div>

            <CMSFilterBlock
                selectedFilters={selectedFilters}
                setSelectedOptions={setSelectedOptions}
                isVisualisePage={true}
            />

            {standardFilters.map(renderFilter)}

            <div className="flex flex-col w-full pb-12 lg:pb-0">
                {advancedFilters.length > 0 && (
                    <>
                        {showAdvanced && (
                            <div className="flex flex-col items-start justify-start gap-y-4 mb-4">
                                {advancedFilters.map(renderFilter)}
                            </div>
                        )}
                        <div className="flex items-center justify-between w-full mt-4">
                            <Button
                                size="xsmall"
                                customClasses="flex items-center gap-1"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                            >
                                {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                            </Button>
                            <Button
                                size="xsmall"
                                customClasses="flex items-center gap-1"
                                onClick={() => {
                                    setSelectedFilters(emptyClinicalTrialsFilters())
                                    setExcludeLinkedTrials(false)
                                }}
                            >
                                Clear All <XIcon className="w-5 h-5" />
                            </Button>
                        </div>
                    </>
                )}
            </div>

            <LinkedTrialsInfoModal
                isOpen={linkedInfoOpen}
                onClose={() => setLinkedInfoOpen(false)}
            />
        </div>
    )
}

function LinkedTrialsInfoModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean
    onClose: () => void
}) {
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-[80]">
            <div className="fixed inset-0 flex w-screen items-center justify-center bg-black/50 p-4 sm:p-6 overflow-y-auto">
                <Dialog.Panel className="relative w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl">
                    <Dialog.Title className="text-secondary text-xl sm:text-2xl pr-10">
                        Linked trials
                    </Dialog.Title>
                    <Dialog.Description className="mt-4 text-secondary/80 leading-relaxed">
                        Linked trials are those that have a primary trial number as a
                        secondary identifier, or a primary trial number named in a
                        &lsquo;child&rsquo; or &lsquo;parent&rsquo; study. However, the
                        level of linkage is unspecified and, therefore, a registered
                        trial linked to another trial could be the same study registered
                        in different countries with or without different research
                        locations, a follow-up study, or similar studies. This assignment
                        is based on information added to the primary registry. Further
                        details of the WHO Trial Registration Dataset can be found{' '}
                        <a
                            href="https://www.who.int/tools/clinical-trials-registry-platform/network/who-data-set"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline hover:no-underline"
                        >
                            here
                        </a>
                        .
                    </Dialog.Description>

                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-4 top-4 text-secondary/50 hover:text-secondary transition-colors"
                    >
                        <span className="sr-only">Close</span>
                        <XIcon className="size-6" aria-hidden="true" />
                    </button>
                </Dialog.Panel>
            </div>
        </Dialog>
    )
}
