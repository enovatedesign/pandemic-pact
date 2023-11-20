import { useState } from "react"
import { PlusIcon, MinusIcon } from "@heroicons/react/solid"
import selectOptions from '../../data/dist/select-options.json'
import { Select, SelectItem, MultiSelect, MultiSelectItem } from "@tremor/react";
import AnimateHeight from 'react-animate-height'

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
        localRow.logicalAnd ? 'right-1 transition duration-300' : 'right-1 -translate-x-[48px] md:-translate-x-[40px] transition duration-300'
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
        <div className="flex space-x-8">
            <div className="w-full text-secondary flex flex-col md:flex-row md:items-center gap-2 bg-gray-100 shadow rounded-2xl p-4">
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
                        <div className={`${andButtonDivClasses} w-6 aspect-square bg-primary rounded-full absolute`}></div>

                        <p className={`${andButtonTextClasses} text-primary absolute uppercase text-xs font-bold`}>
                            {localRow.logicalAnd ? 'and' : 'or'}
                        </p>
                </button>
            </div>
            <div className={`${index === 0 && 'invisible pr-8'} flex items-center`}>
                {children}
            </div>
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
    console.log(rows.length)

    return (
        <section className="p-4">
                <div className='flex justify-between pb-4'>
                    <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:space-x-2  md:pr-[148px]">
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

                    {rows.length < 6 && (
                        <button
                            className=" h-8 flex items-center justify-center bg-secondary rounded-full active:bg-secondary-lighter active:scale-75 transition duration-200"
                            onClick={addRow}
                        >
                            <PlusIcon className="w-8 aspect-square text-primary active:scale-90 transition duration-200" />
                        </button>
                    )}
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
                                <div key={row.key}>
                                    {index > 0 && (
                                        <p className="text-center uppercase tracking-wider py-1 pr-[70px] md:pr-[148px]">
                                            {globalAnd ? 'and' : 'or'}
                                        </p>
                                    )}
                                    <AdvancedInputRow row={row} rows={rows} setRows={setRows} index={index}>
                                        {/* Add remove button function here */}
                                        {index > 0 && (
                                            <button
                                            className="flex items-center justify-center bg-secondary rounded-full active:bg-secondary-lighter active:scale-75 transition duration-200"
                                            onClick={() => removeRow(index)}
                                            >
                                                <MinusIcon className="w-8 aspect-square text-primary active:scale-90 transition duration-200" />
                                            </button>
                                        )}
                                    </AdvancedInputRow>
                                </div>
                            </>
                        )
                    })}
                </div>
            </section>
    )
}

export default AdvancedSearch