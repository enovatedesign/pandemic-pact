import { useState } from "react"
import { PlusIcon, MinusIcon } from "@heroicons/react/solid"
import selectOptions from '../../data/dist/select-options.json'
import { Select, SelectItem, MultiSelect, MultiSelectItem } from "@tremor/react";
import Button from './Button'

const camelToSentence = (word: string) => {
    const result = word.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  interface Row {
    field: string,
    values: string[],
    logicalAnd: boolean,
    key: number
  }

  type AdvancedRowProps = {
    children: any,
    row: Row,
    rows: Row[],
    setRows: ((rows: Row[]) => void),
    index: number,
  }

const AdvancedInputRow = ({children, row, rows, setRows, index} : AdvancedRowProps) => {
    
    const [ localRow, setLocalRow ] = useState<Row>(row)
    
    const selectItems = Object.keys(selectOptions)
    
    const andButtonTextClasses = [
        localRow.logicalAnd ? 'order-first left-3' : 'order-last right-4'
    ].join(' ')

    const andButtonDivClasses = [
        !localRow.logicalAnd && '-translate-x-[48px] md:-translate-x-[37px] lg:-translate-x-[40px] xl:-translate-x-[42px]'
    ].join(' ')

    const onSelectChange = (value: string) => {
        const newRow = {
            ...localRow,
            field: value,
            values: [],
        }

        setLocalRow(newRow)

        setRows(
            rows.map(
                globalRow =>  (globalRow.key === newRow.key) ? newRow : globalRow
            ),
        )
    }

    const onMultiSelectChange = (values: string[]) => {
        const newRow = {
            ...row,
            values,
        }

        setLocalRow(newRow)

        setRows(
            rows.map(
                globalRow => (globalRow.key === newRow.key) ?  newRow : globalRow
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
            rows.map(
                globalRow => (globalRow.key === newRow.key) ?  newRow : globalRow
            )
        )
    }

    return (
        <div className="flex">
            <div className="w-full text-secondary flex flex-col md:flex-row md:items-center gap-2 bg-gray-100 shadow rounded-lg py-3 pl-3 pr-8">
                <Select value={localRow.field} onValueChange={onSelectChange} enableClear={false}>
                    {selectItems.map((key, index) => {
                        return (
                            <SelectItem
                                value={key}
                                key={index}
                                className="cursor-pointer"
                            >
                                {camelToSentence(key)}
                            </SelectItem>
                        )
                    })}
                </Select>

                <MultiSelect value={localRow.values} onValueChange={onMultiSelectChange}>
                    {selectOptions[localRow.field as keyof typeof selectOptions].map((value: {value: string}, index: number) => {
                        return (
                            <MultiSelectItem
                                value={value.value}
                                key={index}
                                className="cursor-pointer"
                            >
                                {value.value}
                            </MultiSelectItem>
                        )
                    })}
                </MultiSelect>

                <button onClick={onLightSwitchChange} className="h-8 relative flex items-center bg-secondary w-20 md:w-40 rounded-full">
                        <div className={`${andButtonDivClasses} w-6 aspect-square bg-primary rounded-full absolute right-1 transition-transform duration-300`}></div>

                        <p className={`${andButtonTextClasses} text-primary absolute uppercase text-xs font-bold`}>
                            {localRow.logicalAnd ? 'and' : 'or'}
                        </p>
                </button>
            </div>
            {children && (
                <div className={`${index === 0 && 'invisible pr-8'} flex items-center`}>
                    {children}
                </div>
            )}
        </div>
    )
}

const AdvancedSearch = () => {
    
    const defaultRow:() => Row = () => ({
        field: 'Regions',
        values: [],
        logicalAnd: false,
        key: new Date().getTime(),
    })

    const [rows, setRows] = useState<Row[]>([defaultRow()])
    const [globalAnd, setGlobalAnd] = useState(true)

    const globalAndButtonTextClasses = [
        globalAnd ? 'order-first left-3' : 'order-last right-4'
    ].join(' ')

    const globalAndButtonDivClasses = [
        globalAnd ? 'right-1 transition duration-300' : 'right-1 -translate-x-[48px] transition duration-300'
    ].join(' ')

    const addRow = () => {
        setRows([...rows, defaultRow()])
    }
    
    const paddingClasses = 'md:pr-[100px]'

    return (
        <section className="p-4">
                <div className="pb-4 flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:space-x-2  md:pr-[148px]">
                    <p className="text-secondary uppercase text-sm">
                        Set the global and/or functionality: 
                    </p>
                    <button onClick={() => setGlobalAnd(!globalAnd)} className="h-8 relative flex items-center bg-secondary w-20 rounded-full">
                            <div className={`${globalAndButtonDivClasses} w-6 aspect-square bg-primary rounded-full absolute`}></div>

                            <p className={`${globalAndButtonTextClasses} text-primary absolute uppercase text-xs font-bold pr-2`}>
                                {globalAnd ? 'and' : 'or'}
                            </p>
                    </button>
                </div>
                <div className="flex flex-col gap-2">
                    {rows.map((row: Row, index: number) => {
                        
                        const removeRow = (index: number) => {
                            const updatedRows = [...rows]
                            updatedRows.splice(index, 1)
                            setRows(updatedRows)
                        }
                        
                        return (
                            <>  
                                <div key={row.key} className="relative w-full">
                                    {index > 0 && (
                                        <p className={`${paddingClasses} py-2 text-center text-secondary uppercase text-sm`}>
                                            {globalAnd ? 'and' : 'or'}
                                        </p>
                                    )}
                                    <AdvancedInputRow row={row} rows={rows} setRows={setRows} index={index}>
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
                            </>
                        )
                    })}
                    {rows.length < 6 && (
                        <div className={`${paddingClasses} flex justify-center`}>
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

export default AdvancedSearch