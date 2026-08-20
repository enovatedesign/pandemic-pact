'use client'

import { useEffect, useId, useState } from 'react'
import Select, { MultiValue, SingleValue } from 'react-select'
import { PlusIcon, MinusIcon } from '@heroicons/react/solid'

import Button from '../../components/Button'
import { customSelectThemeColours } from '../../helpers/select-colours'
import { availableClinicalTrialsFilters } from '../../helpers/filters'
import {
    CtAdvancedSearchRow,
    CtAdvancedSearchState,
    emptyCtAdvancedSearchRow,
} from './search'

const OPTIONS_BASE_PATH = '/data/clinical-trials/select-options'

type Option = { label: string; value: string }

// Fields a user can build an advanced query from — the full CT filter schema
// (standard + advanced). Options for each field are fetched at runtime from the
// public select-options dir (no build-time data dependency).
const fieldSelectOptions: Option[] = availableClinicalTrialsFilters()
    .map(({ field, label }) => ({ value: field, label }))
    .sort((a, b) => a.label.localeCompare(b.label))

// Session cache of per-field options, shared across rows.
const optionsCache = new Map<string, Option[]>()

function useFieldOptions(field: string): Option[] {
    const [options, setOptions] = useState<Option[]>(
        () => optionsCache.get(field) ?? [],
    )

    useEffect(() => {
        if (!field) {
            setOptions([])
            return
        }

        if (optionsCache.has(field)) {
            setOptions(optionsCache.get(field)!)
            return
        }

        let cancelled = false

        fetch(`${OPTIONS_BASE_PATH}/${field}.json`)
            .then(res => (res.ok ? res.json() : []))
            .then((data: Option[]) => {
                optionsCache.set(field, data)
                if (!cancelled) setOptions(data)
            })
            .catch(() => {
                if (!cancelled) setOptions([])
            })

        return () => {
            cancelled = true
        }
    }, [field])

    return options
}

interface Props {
    advancedSearch: CtAdvancedSearchState
    setAdvancedSearch: (advancedSearch: CtAdvancedSearchState) => void
}

export default function ClinicalTrialsAdvancedFilters({
    advancedSearch,
    setAdvancedSearch,
}: Props) {
    const { rows, logicalAnd: globalLogicalAnd } = advancedSearch

    const setRows = (rows: CtAdvancedSearchRow[]) =>
        setAdvancedSearch({ ...advancedSearch, rows })

    const toggleGlobal = () =>
        setAdvancedSearch({ ...advancedSearch, logicalAnd: !globalLogicalAnd })

    const updateRow = (index: number, patch: Partial<CtAdvancedSearchRow>) => {
        setRows(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
    }

    const addRow = () =>
        setAdvancedSearch({
            ...advancedSearch,
            rows: [...rows, emptyCtAdvancedSearchRow('', advancedSearch.nextRowKey)],
            nextRowKey: advancedSearch.nextRowKey + 1,
        })

    const removeRow = (index: number) => {
        setRows(rows.filter((_, i) => i !== index))
    }

    return (
        <section className="p-4">
            <div className="pb-4 flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:space-x-3">
                <p className="text-secondary uppercase text-sm">
                    Combine the rows below with:
                </p>

                <button
                    onClick={toggleGlobal}
                    className="h-8 relative flex items-center bg-secondary w-20 rounded-full"
                    aria-label="Toggle global AND/OR"
                >
                    <div
                        className={`${
                            globalLogicalAnd ? '' : '-translate-x-[48px]'
                        } w-6 aspect-square bg-primary rounded-full absolute right-1 transition-transform duration-300`}
                    ></div>
                    <p
                        className={`${
                            globalLogicalAnd ? 'order-first left-3' : 'order-last right-4'
                        } text-primary absolute uppercase text-xs font-bold`}
                    >
                        {globalLogicalAnd ? 'and' : 'or'}
                    </p>
                </button>
            </div>

            <div className="flex flex-col gap-2">
                {rows.map((row, index) => (
                    <div key={row.key} className="relative w-full">
                        {index > 0 && (
                            <p className="py-2 text-center text-secondary uppercase text-sm">
                                {globalLogicalAnd ? 'and' : 'or'}
                            </p>
                        )}

                        <AdvancedRow
                            row={row}
                            onFieldChange={field =>
                                updateRow(index, { field, values: [] })
                            }
                            onValuesChange={values => updateRow(index, { values })}
                            onLogicalAndChange={logicalAnd =>
                                updateRow(index, { logicalAnd })
                            }
                            onRemove={index > 0 ? () => removeRow(index) : undefined}
                        />
                    </div>
                ))}

                {rows.length < 6 && (
                    <div className="flex justify-center">
                        <Button
                            size="xsmall"
                            customClasses="mt-3 flex items-center gap-1"
                            onClick={addRow}
                        >
                            Add a row <PlusIcon className="w-5 h-5" aria-hidden="true" />
                        </Button>
                    </div>
                )}
            </div>
        </section>
    )
}

interface AdvancedRowProps {
    row: CtAdvancedSearchRow
    onFieldChange: (field: string) => void
    onValuesChange: (values: string[]) => void
    onLogicalAndChange: (logicalAnd: boolean) => void
    onRemove?: () => void
}

function AdvancedRow({
    row,
    onFieldChange,
    onValuesChange,
    onLogicalAndChange,
    onRemove,
}: AdvancedRowProps) {
    const fieldId = useId()
    const valuesId = useId()

    const valueOptions = useFieldOptions(row.field)

    const fieldValue = fieldSelectOptions.find(o => o.value === row.field) ?? null

    const selectedValueOptions = valueOptions.filter(o =>
        row.values.includes(o.value),
    )

    // Rows are persisted, so a value retired by a data refresh can outlive its
    // option. It can't be rendered, and left in state it would go on narrowing
    // results from a select that looks empty. Filtering the row's own values
    // keeps the user's ordering; mapping the options back would rewrite it.
    useEffect(() => {
        if (valueOptions.length === 0) {
            return
        }

        const knownValues = row.values.filter(value =>
            valueOptions.some(option => option.value === value),
        )

        if (knownValues.length !== row.values.length) {
            onValuesChange(knownValues)
        }
    }, [valueOptions, row.values, onValuesChange])

    const themeColours = (theme: any) => ({
        ...theme,
        colors: { ...theme.colors, ...customSelectThemeColours },
    })

    return (
        <div className="flex justify-start">
            <div className="w-full text-secondary flex flex-col md:flex-row md:items-start gap-2 bg-gray-100 shadow rounded-lg py-3 px-3">
                <div className="w-full min-w-10">
                    <Select
                        instanceId={fieldId}
                        options={fieldSelectOptions}
                        value={fieldValue}
                        onChange={(option: SingleValue<Option>) =>
                            onFieldChange(option ? option.value : '')
                        }
                        placeholder="Select a field..."
                        theme={themeColours}
                    />
                </div>

                <div className="w-full min-w-10">
                    <Select
                        isMulti
                        instanceId={valuesId}
                        options={valueOptions}
                        value={selectedValueOptions}
                        onChange={(options: MultiValue<Option>) =>
                            onValuesChange(options.map(o => o.value))
                        }
                        placeholder="Select..."
                        theme={themeColours}
                    />
                </div>

                <button
                    onClick={() => onLogicalAndChange(!row.logicalAnd)}
                    className="h-8 shrink-0 relative flex items-center bg-secondary w-20 rounded-full"
                    aria-label="Toggle row AND/OR"
                >
                    <div
                        className={`${
                            row.logicalAnd ? '' : '-translate-x-[48px]'
                        } w-6 aspect-square bg-primary rounded-full absolute right-1 transition-transform duration-300`}
                    ></div>
                    <p
                        className={`${
                            row.logicalAnd ? 'order-first left-3' : 'order-last right-4'
                        } text-primary absolute uppercase text-xs font-bold`}
                    >
                        {row.logicalAnd ? 'and' : 'or'}
                    </p>
                </button>
            </div>

            {onRemove && (
                <div className="flex items-center pl-2">
                    <button
                        className="flex items-center justify-center bg-secondary rounded-full active:scale-75 transition duration-200"
                        onClick={onRemove}
                        aria-label="Remove row"
                    >
                        <MinusIcon className="w-6 aspect-square text-primary" />
                    </button>
                </div>
            )}
        </div>
    )
}
