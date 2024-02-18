import { useId, useMemo, useState } from 'react'
import Select, { SingleValue, MultiValue } from 'react-select'
import { PlusIcon, MinusIcon } from '@heroicons/react/solid'
import Button from './Button'
import selectOptions from '../../data/dist/select-options.json'
import { SearchFilters } from '../helpers/search'

interface Props {
    setSearchFilters: (searchFilters: SearchFilters) => void
}

interface Row {
    field: string
    values: string[]
    logicalAnd: boolean
    key: number
}

interface SelectedFilters {
    rows: Row[]
    logicalAnd: boolean
}

export default function AdvancedSearch({ setSearchFilters }: Props) {
    const defaultRow: () => Row = () => ({
        field: 'StudySubject',
        values: [],
        logicalAnd: false,
        key: new Date().getTime(),
    })

    const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
        rows: [defaultRow()],
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

    const updateSearchFiltersFromSelectedFilters = (
        newSelectedFilters: SelectedFilters
    ) => {
        setSearchFilters({
            logicalAnd: newSelectedFilters.logicalAnd,
            filters: newSelectedFilters.rows
                .filter(row => row.values.length > 0)
                .map(row => ({
                    field: row.field,
                    values: row.values,
                    logicalAnd: row.logicalAnd,
                })),
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
        setRows([...selectedFilters.rows, defaultRow()])
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
}

function AdvancedInputRow({
    children,
    row,
    rows,
    setRows,
    index,
}: AdvancedRowProps) {
    const [localRow, setLocalRow] = useState<Row>(row)

    const andButtonTextClasses = [
        localRow.logicalAnd ? 'order-first left-3' : 'order-last right-4',
    ].join(' ')

    const andButtonDivClasses = [
        !localRow.logicalAnd &&
            '-translate-x-[48px] md:-translate-x-[37px] lg:-translate-x-[40px] xl:-translate-x-[42px]',
    ].join(' ')

    const onSelectChange = (value: string) => {
        const newRow = {
            ...localRow,
            field: value,
            values: [],
        }

        setLocalRow(newRow)

        setRows(
            rows.map(globalRow =>
                globalRow.key === newRow.key ? newRow : globalRow
            )
        )
    }

    const onMultiSelectChange = (values: string[]) => {
        const newRow = {
            ...row,
            values,
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

    const singleSelectOptions = Object.keys(selectOptions).map(option => ({
        label: camelToSentence(option),
        value: option,
    }))

    const multiSelectOptions =
        selectOptions[localRow.field as keyof typeof selectOptions]

    return (
        <div className="flex">
            <div className="w-full text-secondary flex flex-col md:flex-row md:items-center gap-2 bg-gray-100 shadow rounded-lg py-3 pl-3 pr-8">
                <SingleSelect
                    options={singleSelectOptions}
                    value={localRow.field}
                    onSelectChange={onSelectChange}
                />

                <MultiSelect
                    options={multiSelectOptions}
                    value={localRow.values}
                    onMultiSelectChange={onMultiSelectChange}
                />

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
    value: string
    onSelectChange: (value: string) => void
}

function SingleSelect({ options, value, onSelectChange }: SingleSelectProps) {
    const id = useId()

    const defaultValue: Option = useMemo(
        () => options.find(o => o.value === value) as Option,
        [value, options]
    )

    const onChange = (option: SingleValue<Option>) => {
        onSelectChange(option.value)
    }

    return (
        <Select
            defaultValue={defaultValue}
            options={options}
            onChange={onChange}
            isClearable={false}
            placeholder="Select..."
            instanceId={id}
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
        />
    )
}

function camelToSentence(word: string) {
    const result = word.replace(/([A-Z])/g, ' $1')
    return result.charAt(0).toUpperCase() + result.slice(1)
}
