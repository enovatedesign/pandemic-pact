import { useState } from "react"

const AdvancedInputRow = () => {
    return (
        <p className="text-secondary">
            row
        </p>
    )
}

const AdvancedSearch = () => {
    
    const [rows, setRows] = useState([<AdvancedInputRow key={0}/>])
    
    const addRow = () => {
        const newKey = rows.length
        setRows([...rows, <AdvancedInputRow key={newKey}/>])
    }
    console.log(rows.length)

    return (
        <div className=" w-full bg-white rounded-2xl border-2 border-secondary p-8">
            <h3 className="text-secondary text-2xl">
                Advanced search stuff
            </h3>
            <button
                className="dark:text-secondary"
                onClick={addRow}
            >
                add a row
            </button>
            <div>
                {rows.map(row => {
                    return (
                        <AdvancedInputRow />
                    )
                })}
            </div>
        </div>
    )
}

export default AdvancedSearch