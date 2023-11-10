import { useState } from "react"
import { PlusIcon, MinusIcon } from "@heroicons/react/solid"
import selectOptions from '../../data/dist/select-options.json'
import { Select, SelectItem, MultiSelect, MultiSelectItem } from "@tremor/react";

const camelToSentence = (word: string) => {
    const result = word.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  type Props = {
    children: any
    index: number
    row: any
  }

const AdvancedInputRow = ({children, index, row, rows, setRows} : Props) => {
    
    const [ localRow, setLocalRow ] = useState(row)
    const selectItems = Object.keys(selectOptions)

    const andButtonTextClasses = [
        localRow.logicalAnd ? 'order-first left-3' : 'order-last right-4'
    ].join(' ')

    const andButtonDivClasses = [
        localRow.logicalAnd ? 'right-1 transition duration-300' : 'left-1 transition duration-300'
    ].join(' ')

    const onSelectChange = (value) => {
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

    const onMultiSelectChange = (values) => {
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
            <div className="w-full text-secondary flex flex-col md:flex-row md:items-center gap-2 bg-tremor-content-subtle rounded-2xl p-4">
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
                    {selectOptions[localRow.field].map((value, index) => {
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

                <button onClick={onLightSwitchChange} className="h-8 relative flex items-center bg-secondary w-20 md:w-48 rounded-full">
                        <div className={`${andButtonDivClasses} w-6 aspect-square bg-primary rounded-full absolute`}></div>

                        <p className={`${andButtonTextClasses} text-primary absolute uppercase text-xs font-bold`}>
                            {localRow.logicalAnd ? 'and' : 'or'}
                        </p>
                </button>
            </div>
            <div className="flex items-center">
                {children}
            </div>
        </div>
    )
}

const AdvancedSearch = () => {
    const defaultRow = () => ({
        field: 'Regions',
        values: [],
        logicalAnd: false,
        key: new Date().getTime(),
    })

    const [rows, setRows] = useState([defaultRow()])
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

    return (
        <div className=" w-full bg-white rounded-2xl border-2 border-secondary p-8">
            <div className='flex justify-between pb-8'>
                <h3 className="text-secondary text-xl uppercase">
                    Advanced grant search
                </h3>
                <button
                    className="dark:text-secondary flex items-center justify-center bg-secondary rounded-full active:bg-secondary-lighter active:scale-75 transition duration-200"
                    onClick={addRow}
                >
                    <PlusIcon className="w-8 aspect-square text-primary active:scale-90 transition duration-200" />
                </button>
            </div>
            <div className="flex items-center space-x-2 pb-2">
                <p className="text-secondary uppercase">
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
                {rows.map((row, index) => {

                    const removeRow = (index: number) => {
                        const updatedRows = [...rows]
                        updatedRows.splice(index, 1)
                        setRows(updatedRows)
                    }

                    return (
                        <>
                            <div key={row.key}>
                                {index > 0 && (
                                    <p className="text-center uppercase tracking-wider py-1 pr-[70px] md:pr-[156px]">
                                        {globalAnd ? 'and' : 'or'}
                                    </p>
                                )}
                                <AdvancedInputRow row={row} rows={rows} setRows={setRows}>
                                    {/* Add remove button function here */}
                                    <button
                                        className="dark:text-secondary flex items-center justify-center bg-secondary rounded-full active:bg-secondary-lighter active:scale-75 transition duration-200"
                                        onClick={() => removeRow(index)}
                                    >
                                        <MinusIcon className="w-8 aspect-square text-primary active:scale-90 transition duration-200" />
                                    </button>
                                </AdvancedInputRow>
                            </div>
                        </>
                    )
                })}
            </div>
        </div>
    )
}

export default AdvancedSearch