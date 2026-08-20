import { useId, useMemo } from 'react'
import Select, { MultiValue, SingleValue } from 'react-select'
import { PlusIcon, MinusIcon } from '@heroicons/react/solid'
import Button from './Button'
import selectOptions from '../../data/dist/select-options.json'
import hierarchyFilters from '../../public/manual-hierarchy-filters.json'
import {
    AdvancedSearchRow,
    AdvancedSearchState,
    emptyAdvancedSearchRow,
    JOINT_FUNDING_FIELD,
    jointFundingFilterOptions,
} from '../helpers/search'
import { advancedSearchFields } from '../helpers/grants-explore-filters'
import { customSelectThemeColours } from '../helpers/select-colours'

type StrainOption = { label: string; value: string }
type DiseaseWithStrains = { label: string; value: string; strains: StrainOption[] }

// Pre-compute the diseases that carry strain sub-options from the hierarchy file.
// The advanced search shows a strain sub-filter whenever the user selects one of
// these in the Diseases multi-select (e.g. influenza H-subtypes, Ebola).
const diseasesWithStrains: DiseaseWithStrains[] = hierarchyFilters.flatMap(family =>
    (family.pathogens ?? []).flatMap(pathogen =>
        (pathogen.diseases ?? [])
            .filter(d => (d.strains ?? []).length > 0)
            .map(d => ({
                label: d.label,
                value: d.value,
                strains: d.strains.filter(
                    s => !['Other', 'Unspecified', 'Not applicable'].includes(s.label),
                ),
            })),
    ),
)

const diseasesWithStrainsByValue: Record<string, DiseaseWithStrains> = Object.fromEntries(
    diseasesWithStrains.map(d => [d.value, d]),
)

const MAXIMUM_ROWS = 6

interface Props {
    advancedSearch: AdvancedSearchState
    setAdvancedSearch: (advancedSearch: AdvancedSearchState) => void
}

export default function AdvancedSearch({
    advancedSearch,
    setAdvancedSearch,
}: Props) {
    const { rows, logicalAnd } = advancedSearch

    const setRows = (rows: AdvancedSearchRow[]) =>
        setAdvancedSearch({ ...advancedSearch, rows })

    const updateRow = (updatedRow: AdvancedSearchRow) =>
        setRows(rows.map(row => (row.key === updatedRow.key ? updatedRow : row)))

    const toggleLogicalAnd = () =>
        setAdvancedSearch({ ...advancedSearch, logicalAnd: !logicalAnd })

    const addRow = () =>
        setAdvancedSearch({
            ...advancedSearch,
            rows: [...rows, emptyAdvancedSearchRow('', advancedSearch.nextRowKey)],
            nextRowKey: advancedSearch.nextRowKey + 1,
        })

    const removeRow = (index: number) =>
        setRows(rows.filter((_, i) => i !== index))

    const globalAndButtonTextClasses = logicalAnd
        ? 'order-first left-3'
        : 'order-last right-4'

    const globalAndButtonDivClasses = logicalAnd
        ? 'right-1 transition duration-300'
        : 'right-1 -translate-x-[48px] transition duration-300'

    const paddingClasses = 'md:pr-[100px]'

    return (
        <section className="p-4">
            <div className="pb-4 flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:space-x-2  md:pr-[148px]">
                <p className="text-secondary uppercase text-sm">
                    Set the global and/or functionality:
                </p>

                <button
                    onClick={toggleLogicalAnd}
                    className="h-8 relative flex items-center bg-secondary w-20 rounded-full"
                >
                    <div
                        className={`${globalAndButtonDivClasses} w-6 aspect-square bg-primary rounded-full absolute`}
                    ></div>

                    <p
                        className={`${globalAndButtonTextClasses} text-primary absolute uppercase text-xs font-bold pr-2`}
                    >
                        {logicalAnd ? 'and' : 'or'}
                    </p>
                </button>
            </div>
            <div className="flex flex-col gap-2">
                {rows.map((row: AdvancedSearchRow, index: number) => {
                    return (
                        <div key={row.key} className="relative w-full">
                            {index > 0 && (
                                <p
                                    className={`${paddingClasses} py-2 text-center text-secondary uppercase text-sm`}
                                >
                                    {logicalAnd ? 'and' : 'or'}
                                </p>
                            )}

                            <AdvancedInputRow
                                row={row}
                                updateRow={updateRow}
                                index={index}
                            >
                                {index > 0 && (
                                    <button
                                        className="absolute right-0 translate-x-1/2 flex items-center justify-center bg-secondary rounded-full active:bg-secondary-lighter active:scale-75 transition duration-200"
                                        onClick={() => removeRow(index)}
                                    >
                                        <MinusIcon className="w-6 aspect-square text-primary active:scale-90 transition duration-200" />
                                    </button>
                                )}
                            </AdvancedInputRow>
                        </div>
                    )
                })}

                {rows.length < MAXIMUM_ROWS && (
                    <div className={`${paddingClasses} flex justify-center`}>
                        <Button
                            size="xsmall"
                            customClasses="mt-3 flex items-center gap-1"
                            onClick={addRow}
                        >
                            Add a row{' '}
                            <PlusIcon className="w-5 h-5" aria-hidden="true" />
                        </Button>
                    </div>
                )}
            </div>
        </section>
    )
}

type AdvancedRowProps = {
    children: any
    row: AdvancedSearchRow
    updateRow: (row: AdvancedSearchRow) => void
    index: number
}

function AdvancedInputRow({
    children,
    row,
    updateRow,
    index,
}: AdvancedRowProps) {
    const andButtonTextClasses = [
        row.logicalAnd ? 'order-first left-3' : 'order-last right-4',
    ].join(' ')

    const andButtonDivClasses = [
        !row.logicalAnd &&
            '-translate-x-[48px] md:-translate-x-[37px] lg:-translate-x-[40px] xl:-translate-x-[42px]',
    ].join(' ')

    // Set the base options for single select options
    const baseSingleSelectOptions = advancedSearchFields.map(option => ({
        label: camelToSentence(option),
        value: option,
    }))

    // Set the joint funding object for the single select
    const jointFunding = {
        label: 'Joint Funding',
        value: JOINT_FUNDING_FIELD
    }

    // Add Joint funding to the array of base select options
    // This cannot be included in standard select options as the logic for
    // handling joint funding is unique
    const singleSelectOptions = [
        ...baseSingleSelectOptions,
        jointFunding
    ]

    const multiSelectOptions = selectOptions[row.field as keyof typeof selectOptions]

    const onSelectChange = (field: string) => {
        updateRow({
            ...row,
            field,
            values: [],
            subCategoryParent: { field: null, value: null },
            subCategoryChild: { field: null, value: null },
        })
    }

    const onMultiSelectChange = (values: string[]) => {
        // If the previously-cascaded disease is no longer selected, clear the
        // cascade. (Multi-select can leave other cascade-eligible diseases
        // selected, but the specific parent value must still be in values.)
        const parentStillSelected =
            row.subCategoryParent.value !== null &&
            values.includes(row.subCategoryParent.value)

        updateRow({
            ...row,
            values,
            ...(parentStillSelected
                ? {}
                : {
                      subCategoryParent: { field: null, value: null },
                      subCategoryChild: { field: null, value: null },
                  }),
        })
    }

    const onLightSwitchChange = () => {
        updateRow({ ...row, logicalAnd: !row.logicalAnd })
    }

    // Surface a strain sub-filter cascade when the user selects a disease that
    // carries strains in the manual hierarchy (e.g. influenza H-subtypes, Ebola).
    // The parent dropdown lets the user pick which of their selected diseases
    // to narrow when more than one is eligible; the child dropdown lists strains.
    const cascadeEligibleDiseases = row.values
        .map(value => diseasesWithStrainsByValue[value])
        .filter((d): d is DiseaseWithStrains => Boolean(d))

    const cascadeShouldShow = cascadeEligibleDiseases.length > 0

    const cascadeParentOptions: Option[] = cascadeEligibleDiseases.map(d => ({
        value: d.value,
        label: d.label,
    }))

    const selectedDiseaseForCascade = cascadeEligibleDiseases.find(
        d => d.value === row.subCategoryParent.value,
    )

    const cascadeChildOptions: Option[] = selectedDiseaseForCascade?.strains ?? []

    const onCascadeParentSelectChange = (value: string) => {
        const parentValue = value || null

        // The parent value tracks the user-selected disease but is not turned
        // into a filter row (the disease is already in the Diseases multi-select).
        updateRow({
            ...row,
            subCategoryParent: { field: null, value: parentValue },
            ...(row.subCategoryParent.value === parentValue
                ? {}
                : { subCategoryChild: { field: null, value: null } }),
        })
    }

    const onCascadeChildSelectChange = (value: string) => {
        updateRow({
            ...row,
            subCategoryChild: {
                field: value ? 'Strains' : null,
                value: value || null,
            },
        })
    }

    return (
        <div className="flex justify-start">
            <div className="w-full text-secondary flex flex-col md:flex-row md:items-start gap-2 bg-gray-100 shadow rounded-lg py-3 pl-3 pr-8">
                <div className="w-full min-w-10">
                    <SingleSelect
                        options={singleSelectOptions}
                        value={row.field}
                        onSelectChange={onSelectChange}
                    />
                </div>

                <div className="w-full min-w-10 flex flex-col gap-y-2">
                    {row.field === jointFunding.value ? (
                        // Held on the row like any other selection, so removing
                        // the row or changing its field drops the constraint.
                        <SingleSelect
                            options={jointFundingFilterOptions}
                            value={row.values[0] ?? null}
                            onSelectChange={value =>
                                updateRow({
                                    ...row,
                                    values: value ? [value] : [],
                                })
                            }
                        />
                    ) : (
                        <MultiSelect
                            options={multiSelectOptions}
                            value={row.values}
                            onMultiSelectChange={onMultiSelectChange}
                        />
                    )}

                    {cascadeShouldShow && (
                        <>
                            <SingleSelect
                                options={cascadeParentOptions}
                                value={row.subCategoryParent.value}
                                onSelectChange={onCascadeParentSelectChange}
                            />
                            {row.subCategoryParent.value &&
                                cascadeChildOptions.length > 0 && (
                                    <SingleSelect
                                        options={cascadeChildOptions}
                                        value={row.subCategoryChild.value}
                                        onSelectChange={onCascadeChildSelectChange}
                                    />
                                )}
                        </>
                    )}
                </div>

                <button
                    onClick={onLightSwitchChange}
                    className="h-8 relative flex items-center bg-secondary w-20 md:w-40 rounded-full"
                >
                    <div
                        className={`${andButtonDivClasses} w-6 aspect-square bg-primary rounded-full absolute right-1 transition-transform duration-300`}
                    ></div>

                    <p
                        className={`${andButtonTextClasses} text-primary absolute uppercase text-xs font-bold`}
                    >
                        {row.logicalAnd ? 'and' : 'or'}
                    </p>
                </button>
            </div>

            {children && (
                <div
                    className={`${
                        index === 0 && 'invisible pr-8'
                    } flex items-center`}
                >
                    {children}
                </div>
            )}
        </div>
    )
}

type Option = {
    label: string
    value: string
}

type SingleSelectProps = {
    options: Option[]
    value: string | null
    onSelectChange: (value: string) => void
}

// Controlled rather than defaultValue-driven: a restored, shared or cleared
// state has to be reflected in a select that is already mounted.
function SingleSelect({ options, value, onSelectChange }: SingleSelectProps) {
    const id = useId()

    const selectedOption: Option | null = useMemo(
        () => options.find(o => o.value === value) ?? null,
        [value, options],
    )

    const onChange = (option: SingleValue<Option> | null) => {
        onSelectChange(option ? option.value : '')
    }

    return (
        <Select
            value={selectedOption}
            options={options}
            onChange={onChange}
            isClearable={true}
            placeholder="Select..."
            instanceId={id}
            theme={(theme) => ({
                ...theme,
                colors: {
                    ...theme.colors,
                    ...customSelectThemeColours,
                },
            })}
        />
    )
}

type MultiSelectProps = {
    options: Option[]
    value: string[]
    onMultiSelectChange: (value: string[]) => void
}

function MultiSelect({
    options,
    value,
    onMultiSelectChange,
}: MultiSelectProps) {
    const id = useId()

    const selectedOptions: Option[] = useMemo(
        () =>
            value
                .map(option => options?.find(o => o.value === option))
                .filter((option): option is Option => option !== undefined),
        [value, options],
    )

    const onChange = (option: MultiValue<Option>) => {
        onMultiSelectChange(option.map(o => o.value))
    }

    return (
        <Select
            isMulti
            options={options}
            onChange={onChange}
            value={selectedOptions}
            placeholder="Select..."
            instanceId={id}
            theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  ...customSelectThemeColours,
                },
              })}
        />
    )
}

function camelToSentence(word: string) {
    const result = word.replace(/([A-Z])/g, ' $1')
    return result.charAt(0).toUpperCase() + result.slice(1)
}
