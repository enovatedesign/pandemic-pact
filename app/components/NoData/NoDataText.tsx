"use client"

import { useContext } from "react"
import { GlobalFilterContext } from "../../helpers/filters"

const NoDataText = () => {
    const { filters } = useContext(GlobalFilterContext)
    
    const filterLength = Object.entries(filters)
        .filter(([_, filter]) => filter.values.length > 0)
        .map(([key]) => key)
        .length
    
    const text = `No data available due to applied ${filterLength === 1 ? 'filter' : 'filters'}.`
    
    return (
        <div className="w-full h-full absolute inset-0 z-20 flex items-center justify-center">
            <div className="bg-white px-4 py-3 rounded-md border border-brand-grey-600">
                <p className="text-brand-grey-600 max-w-none prose">
                    {text}
                </p>
            </div>
        </div>
    )
}

export default NoDataText