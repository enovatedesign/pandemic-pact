import { useState, useEffect } from "react"
import { PlusIcon, MinusIcon } from "@heroicons/react/solid"
import selectOptions from '../../data/dist/select-options.json'
import { Select, SelectItem, MultiSelect, MultiSelectItem } from "@tremor/react";
import { reportWebVitals } from "next/dist/build/templates/pages";

const camelToSentence = (word: string) => {
    const result = word.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

const AdvancedInputRow = ({children}) => {
    
    const [value, setValue] = useState("Regions")
    const [multiValue, setMultiValue] = useState("")
    const selectItems = Object.keys(selectOptions)
    const multiSelectItems = selectOptions[value]
    const [and, setAnd] = useState(true)

    const andButtonTextClasses = [
        and ? 'order-first left-3' : 'order-last right-4'
    ].join(' ')

    const andButtonDivClasses = [
        and ? 'right-2' : 'left-2'
    ].join(' ')
    
    return (
        <div className="flex space-x-8">

            <div className="w-full text-secondary flex flex-col lg:flex-row gap-8 bg-primary rounded-2xl p-4">
                <Select value={value} onValueChange={setValue}>
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
                <MultiSelect >
                    {multiSelectItems.map((value, index) => {
                        return (
                            <MultiSelectItem
                                value={value}
                                key={index}
                                className="cursor-pointer"
                            >
                                {value.value}
                            </MultiSelectItem>
                        )
                    })}
                </MultiSelect>
   
                    <button onClick={() => setAnd(!and)} className="relative flex items-center bg-secondary w-48 rounded-full">
                            <div className={`${andButtonDivClasses} w-6 aspect-square bg-primary rounded-full absolute`}></div>

                            <p className={`${andButtonTextClasses} text-primary absolute uppercase `}>
                                {and ? 'and' : 'or'}
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
    
    const [rows, setRows] = useState([<AdvancedInputRow key={1}/>])
    
    const addRow = () => {
        const newKey = rows.length
        setRows([...rows, <AdvancedInputRow key={newKey}/>])
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
            <div className="flex flex-col gap-2">
                {rows.map((row) => {

                    return (
                        <AdvancedInputRow key={row}>
                            {/* Add remove button function here */}
                            <button
                                className="dark:text-secondary flex items-center justify-center bg-secondary rounded-full active:bg-secondary-lighter active:scale-75 transition duration-200"
                            >
                                <MinusIcon className="w-8 aspect-square text-primary active:scale-90 transition duration-200" />
                            </button>
                        </AdvancedInputRow>
                    )
                })}
            </div>
        </div>
    )
}

export default AdvancedSearch