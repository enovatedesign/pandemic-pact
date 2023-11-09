import { useState } from "react"
import { PlusIcon } from "@heroicons/react/solid"
import selectOptions from '../../data/dist/select-options.json'
import { Select, SelectItem, MultiSelect, MultiSelectItem } from "@tremor/react";

const camelToSentence = (word: string) => {
    const result = word.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

const AdvancedInputRow = () => {

    const keys = Object.keys(selectOptions)

    const [filter, setFilter] = useState(null)
    // const [and, setAnd] = useState(true)
    return (
        <div className="text-secondary flex flex-col lg:flex-row gap-8">
            <Select>
                {keys.map((key, index) => {
                    return (
                        <SelectItem
                            onSelect={() => setFilter(key)}
                            value={key}
                            key={index}
                            className="cursor-pointer"
                        >
                            {camelToSentence(key)}
                        </SelectItem>
                    )
                })}
            </Select>

            <MultiSelect>
                
            </MultiSelect>
            {/* <button
                onClick={() => setAnd(!and)}
                className="w-20"
            >
                <p>
                    Switch filter
                    <span>
                        {and ? 'or' : 'and'}
                    </span>
                </p>
                
            </button> */}
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
                    <PlusIcon onClick={addRow} className="w-8 aspect-square text-primary active:scale-90 transition duration-200" />
                </button>
            </div>
            <div className="flex flex-col gap-2">
                {rows.map(row => {
                    return (
                        <AdvancedInputRow key={row}/>
                    )
                })}
            </div>
        </div>
    )
}

export default AdvancedSearch