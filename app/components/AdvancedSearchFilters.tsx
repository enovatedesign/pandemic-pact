import { useId, useMemo, useState, useRef, forwardRef, Ref } from 'react'
import Select, { MultiValue, SingleValue, SelectInstance } from 'react-select'
import { PlusIcon, MinusIcon } from '@heroicons/react/solid'
import Button from './Button'
import selectOptions from '../../data/dist/select-options.json'
import { Filter, jointFundingFilterOptions, SearchFilters } from '../helpers/search'
import { customSelectThemeColours } from '../helpers/select-colours'

interface Props {
    setSearchFilters: (searchFilters: SearchFilters) => void
    setJointFundingFilter: (jointFundingFilter: string) => void
}

interface Row {
    field: string
    jointFunding: string
    values: string[]
    logicalAnd: boolean
    key: string
    subCategoryParent: {
        field: string | null
        value: string | null
    }
    subCategoryChild: {
        field: string | null
        value: string | null
    }
}

interface SelectedFilters {
    rows: Row[]
    logicalAnd: boolean
}

export default function AdvancedSearch({ setSearchFilters, setJointFundingFilter }: Props) {
    const defaultRow: (field: string) => Row = field => ({
        field: field,
        jointFunding: '',
        values: [],
        logicalAnd: false,
        key: `${field}-${new Date().getTime()}`,
        subCategoryParent: {
            field: null,
            value: null
        },
        subCategoryChild: {
            field: null,
            value: null
        }
    })

    const defaultRowsArray: (fields: string[]) => Row[] = fields => {
        const rows: Row[] = []
        for (let i = 0; i < fields.length; i++) {
            rows.push(defaultRow(fields[i % fields.length]))
        }
        return rows
    }

    const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
        rows: defaultRowsArray(['StudySubject', 'Ethnicity']),
        logicalAnd: true,
    })

    const globalAndButtonTextClasses = [
        selectedFilters.logicalAnd
            ? 'order-first left-3'
            : 'order-last right-4',
    ].join(' ')

    const globalAndButtonDivClasses = [
        selectedFilters.logicalAnd
            ? 'right-1 transition duration-300'
            : 'right-1 -translate-x-[48px] transition duration-300',
    ].join(' ')

    // updateSearchFiltersFromSelectedFilters takes the selected filters and re formats the rows
    // into the format expected by the search API
    // Rows include subCategory(Parent/Child) which is used for the frontend, if these exist in the row
    // we need to re format those into their own row for the search API.
    const updateSearchFiltersFromSelectedFilters = (
        newSelectedFilters: SelectedFilters
    ) => {
        // Build the new filters
        const newFilters = newSelectedFilters.rows
            .filter(row => row.values.length > 0)
            .map(row => ({
                field: row.field,
                values: row.values,
                logicalAnd: row.logicalAnd,
            }))

        // If a parent filter exists, build a new filter in the correct format
        const parentFilters = newSelectedFilters.rows
            .map(row => {
                if (row.subCategoryParent.field && row.subCategoryParent.value) {
                    return {
                        field: row.subCategoryParent.field,
                        values: [row.subCategoryParent.value],
                        logicalAnd: true,
                    }
                }
            }
        )
        
        // If a child filter exists, build a new filter in the correct format
        const childFilters = newSelectedFilters.rows
            .map(row => {
                if (row.subCategoryChild.field && row.subCategoryChild.value) {
                    return {
                        field: row.subCategoryChild.field,
                        values: [row.subCategoryChild.value],
                        logicalAnd: true,
                    }
                }
            }
        )
        
        // Push the additional filters to a new array and filter out any rows returning falsy values
        const updatedFilters = [
            ...newFilters, 
            ...parentFilters, 
            ...childFilters
        ].filter(row => !!row) as Filter[];
        
        setSearchFilters({
            logicalAnd: newSelectedFilters.logicalAnd,
            filters: updatedFilters
        })
    }

    const toggleLogicalAnd = () => {
        const newSelectedFilters = {
            ...selectedFilters,
            logicalAnd: !selectedFilters.logicalAnd,
        }

        updateSearchFiltersFromSelectedFilters(newSelectedFilters)

        setSelectedFilters(newSelectedFilters)
    }

    const setRows = (rows: Row[]) => {
        const newSelectedFilters = {
            ...selectedFilters,
            rows,
        }
        updateSearchFiltersFromSelectedFilters(newSelectedFilters)

        setSelectedFilters(newSelectedFilters)
    }

    const addRow = () => {
        setRows([...selectedFilters.rows, defaultRow('')])
    }

    const removeRow = (index: number) => {
        setRows(selectedFilters.rows.filter((_, i) => i !== index))
    }

    const paddingClasses = 'md:pr-[100px]'

    return (
        <section className="p-4">
            <div className="pb-4 flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:space-x-2  md:pr-[148px]">
                <p className="text-secondary uppercase text-sm">
                    Set the global and/or functionality:
                </p>

                <button
                    onClick={() => toggleLogicalAnd()}
                    className="h-8 relative flex items-center bg-secondary w-20 rounded-full"
                >
                    <div
                        className={`${globalAndButtonDivClasses} w-6 aspect-square bg-primary rounded-full absolute`}
                    ></div>

                    <p
                        className={`${globalAndButtonTextClasses} text-primary absolute uppercase text-xs font-bold pr-2`}
                    >
                        {selectedFilters.logicalAnd ? 'and' : 'or'}
                    </p>
                </button>
            </div>
            <div className="flex flex-col gap-2">
                {selectedFilters.rows.map((row: Row, index: number) => {
                    return (
                        <div key={row.key} className="relative w-full">
                            {index > 0 && (
                                <p
                                    className={`${paddingClasses} py-2 text-center text-secondary uppercase text-sm`}
                                >
                                    {selectedFilters.logicalAnd ? 'and' : 'or'}
                                </p>
                            )}

                            <AdvancedInputRow
                                row={row}
                                rows={selectedFilters.rows}
                                setRows={setRows}
                                index={index}
                                setJointFundingFilter={setJointFundingFilter}
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

                {selectedFilters.rows.length < 6 && (
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
    row: Row
    rows: Row[]
    setRows: (rows: Row[]) => void
    index: number
    setJointFundingFilter: (jointFundingFilter: string) => void
}

function AdvancedInputRow({
    children,
    row,
    rows,
    setRows,
    index,
    setJointFundingFilter
}: AdvancedRowProps) {
    const [localRow, setLocalRow] = useState<Row>(row)
    
    // Define a ref for the subcategories, this is used to clearValue() on select change
    const subCategoryChildSelectRef = useRef<SelectInstance>()
    const subCategoryParentSelectRef = useRef<SelectInstance>()

    const clearParentValue = () => {
        if (subCategoryParentSelectRef.current) {
            subCategoryParentSelectRef.current.clearValue()
        }
    }

    const clearChildValue = () => {
        if (subCategoryChildSelectRef.current) {
            subCategoryChildSelectRef.current.clearValue()
        }
    }

    const andButtonTextClasses = [
        localRow.logicalAnd ? 'order-first left-3' : 'order-last right-4',
    ].join(' ')

    const andButtonDivClasses = [
        !localRow.logicalAnd &&
            '-translate-x-[48px] md:-translate-x-[37px] lg:-translate-x-[40px] xl:-translate-x-[42px]',
    ].join(' ')

    // Set the base options for single select options
    const baseSingleSelectOptions = Object.keys(selectOptions).map(option => ({
        label: camelToSentence(option),
        value: option,
    }))

    // Set the joint funding object for the single select
    const jointFunding = {
        label: 'Joint Funding',
        value: 'JointFunding'
    }

    // Add Joint funding to the array of base select options
    // This cannot be included in standard select options as the logic for 
    // handling joint funding is unique
    const singleSelectOptions = [
        ...baseSingleSelectOptions,
        jointFunding
    ]

    const multiSelectOptions = selectOptions[localRow.field as keyof typeof selectOptions]
    
    const onSelectChange = (field: string) => {
        const newRow = {
            ...localRow,
            field: field,
            values: [],
        }
        setLocalRow(newRow)

        setRows(rows.map(globalRow => globalRow.key === newRow.key ? newRow : globalRow))
    }

    const onMultiSelectChange = (values: string[]) => {
        let newRow = {
            ...row,
            values,
        }

        // Clear values based on multi new row
        if (!newRow.values.includes('6142004')) {
            clearParentValue()
            clearChildValue()

            newRow = {
                ...newRow,
                subCategoryParent: {
                    field: null, 
                    value: null,
                },
                subCategoryChild: {
                    field: null, 
                    value: null,
                }
            }
        }
        
        setLocalRow(newRow)

        setRows(
            rows.map(globalRow =>
                globalRow.key === newRow.key ? newRow : globalRow
            )
        )
    }

    const onLightSwitchChange = () => {
        const newRow = {
            ...row,
            logicalAnd: !localRow.logicalAnd,
        }

        setLocalRow(newRow)

        setRows(
            rows.map(globalRow =>
                globalRow.key === newRow.key ? newRow : globalRow
            )
        )
    }

    // Set a boolean based on whether or not pandemic prone influenza is selected by
    // the presence of the value (614004) in localRow.values
    // This is used to display the parent dropdown
    const pandemicProneInfluenzaIsSelected = localRow.values.includes('6142004')
    
    // Set state for the parent option, this is used to show the child dropdown
    const [pandemicProneInfluenzaParentIsSelected, setPandemicProneParentIsSelected] = useState(false)

    // Set the parent dropdown options to 'InfluenzaA' and filter out unwanted options
    const pandemicProneInfluenzaParentOptions = selectOptions['InfluenzaA']
        .filter(option => !['Other', 'Not applicable', 'Unspecified'].includes(option.label))

    // Set default state to the child options of the parent to an empty array
    const [pandemicProneChildOptions, setPandemicProneChildOptions] = useState<Option[]>([])
    
    // Handle the state of the child options using the value of the parent selected
    // Handle the state to show that a parent filter has been selected
    // Update the local row and rows
    const onInfluenzaParentSelectChange = (value: string) => {
        // Retrieve the selected option to gain access to the label via the value
        // This is to dynamically get the related data from the select options (due to the data structure)
        const selectedOption = pandemicProneInfluenzaParentOptions.find(
            option => option.value === value
        )

        // Selected option label is available, handle the state of the children options
        if (selectedOption?.label) {
            // Dynamically retrieve the related data from the select options (due to the data structure)
            // Filter out options that are not wanted
            setPandemicProneChildOptions(
                selectOptions[`Influenza${selectedOption?.label}` as keyof typeof selectOptions]
                .filter(option => !['Other', 'Not applicable', 'Unspecified']
                .includes(option.label))
            ) 
        } else {
            // If no option is selected, clear the child options. This ensures the parent option can be cleared
            setPandemicProneChildOptions([])
        }        

        // Define the field manually as 'InfluenzaA' to ensure functioning logic (due to the data structure)
        // add the value to the new filtered array of values
        let updatedRow = {
            ...localRow,
            subCategoryParent: {
                field: 'InfluenzaA',
                value: value
            },
        }
        
        // Clear the child select value based on subCategoryChildOverride state
        if (localRow.subCategoryParent.value !== value) {
            clearChildValue()

            updatedRow = {
                ...updatedRow,
                subCategoryChild: {
                    field: null,
                    value: null
                }
            }
        }

        setLocalRow(updatedRow)
        
        setRows(rows.map(globalRow => globalRow.key === updatedRow.key ? updatedRow : globalRow))
        
        setPandemicProneParentIsSelected(true)  
    }
    
    const onInfluenzaChildSelectChange = (value: string) => {
        // Value options 'h1n1', 'h2n2', 'h3n2', 'h5n', 'h5n6', 'h7n9' 
        // Define the field for the row eg: InfluenzaH5
        const selectedField = `Influenza${value.charAt(0).toUpperCase() + value.charAt(1)}`
        
        const updatedRow = {
            ...localRow,
            subCategoryChild: {
                field: selectedField,
                value: value
            },
        }

        setLocalRow(updatedRow)
        
        setRows(rows.map(globalRow => globalRow.key === updatedRow.key ? updatedRow : globalRow))
    }
    
    return (
        <div className="flex justify-start">
            <div className="w-full text-secondary flex flex-col md:flex-row md:items-start gap-2 bg-gray-100 shadow rounded-lg py-3 pl-3 pr-8">
                <div className="w-full min-w-10">
                    <SingleSelect
                        options={singleSelectOptions}
                        value={localRow.field}
                        onSelectChange={onSelectChange}
                    />
                </div>

                <div className="w-full min-w-10 flex flex-col gap-y-2">
                    {localRow.field === jointFunding.value ? (
                        <SingleSelect
                            options={jointFundingFilterOptions}
                            value={jointFundingFilterOptions[0].value}
                            onSelectChange={setJointFundingFilter}
                        />
                    ) : (
                        <MultiSelect
                            options={multiSelectOptions}
                            value={localRow.values}
                            onMultiSelectChange={onMultiSelectChange}
                        />
                    )}

                    {pandemicProneInfluenzaIsSelected && (
                        <>
                            <SingleSelect
                                options={pandemicProneInfluenzaParentOptions}
                                value={localRow.subCategoryParent.value}
                                onSelectChange={onInfluenzaParentSelectChange}
                                ref={subCategoryParentSelectRef}
                            /> 
                            {pandemicProneInfluenzaParentIsSelected && (
                                <SingleSelect
                                    options={pandemicProneChildOptions}
                                    value={localRow.subCategoryChild.value}
                                    onSelectChange={onInfluenzaChildSelectChange}
                                    ref={subCategoryChildSelectRef}
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
                        {localRow.logicalAnd ? 'and' : 'or'}
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

const SingleSelect = forwardRef<any, SingleSelectProps>(
    ({ options, value, onSelectChange, ...rest }: SingleSelectProps, ref: Ref<any>) => {
        const id = useId()

        const defaultValue: Option = useMemo(
            () => options.find(o => o.value === value) as Option,
            [value, options]
        )
        
        const onChange = (option: SingleValue<Option> | null) => {
            onSelectChange(option ? option.value : '')
        }
        
        return (
            <Select
                {...rest}
                defaultValue={defaultValue}
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
                ref={ref ?? null}
            />
        )
    }
)

// Add display name for updated SingleSelect using forwardRef
SingleSelect.displayName = 'SingleSelect'

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

    const defaultValue: Option[] = useMemo(() => {
        return value.map(option => {
            return options.find(o => o.value === option)
        }) as Option[]
    }, [value, options])

    const onChange = (option: MultiValue<Option>) => {
        onMultiSelectChange(option.map(o => o.value))
    }
    
    return (
        <Select
            isMulti
            options={options}
            onChange={onChange}
            defaultValue={defaultValue}
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
