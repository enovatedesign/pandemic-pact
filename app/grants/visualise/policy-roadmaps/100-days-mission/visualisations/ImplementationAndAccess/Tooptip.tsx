import { dollarValueFormatter } from "@/app/helpers/value-formatters"

interface ImplementationAndAccessTooltipContentTooltipGroup {
  Colour: string
  'Total Grants': number
  'Known Financial Commitments (USD)': number
}

interface ImplementationAndAccessTooltipContentProps {
    title?: string
    summary?: string
    items: Record<string, ImplementationAndAccessTooltipContentTooltipGroup>
}

const ImplementationAndAccessTooltipContent = ({ 
    title, 
    summary,  
    items 
}: ImplementationAndAccessTooltipContentProps) => (
    <div className="bg-white max-w-full md:max-w-none rounded-lg text-sm border opacity-100 shadow border-gray-100">
        <div className="border-gray-100 border-b px-4 py-2 space-y-1">
            {title && (
                <p className="font-medium text-gray-700">{title}</p>
            )}

            {summary && (
                <p className="max-w-80 text-xs text-gray-500">
                    {summary}
                </p>
            )}
        </div>

        {items && (
            <div className="px-4 py-2 space-y-1">
                {Object.entries(items).map(([title, data]) => {
                    const colour= data['Colour']
                    
                    return (
                    <div key={title}>
                        <div className="flex items-center space-x-2">
                            {colour && (
                                <span
                                    className="shrink-0 rounded-full border-2 h-3 w-3 border-white shadow"
                                    style={{ backgroundColor: colour }}
                                />
                            )}
                            <p>
                                {title}
                            </p>
                        </div>
                        
                        <ul className="pl-5">
                            {Object.entries(data).map(([ label, value ]) => {
                                const formattedValue = label === 'Known Financial Commitments (USD)' ? 
                                    dollarValueFormatter(value) : 
                                    value

                                return label !== 'Colour' &&  (
                                    <li key={label} className="flex items-center justify-between space-x-8">
                                        <div className="flex items-center space-x-2">
                                            <p
                                                className="text-left text-gray-700"
                                            >
                                                {label}
                                            </p>
                                        </div>

                                        <div className="flex justify-between items-center gap-x-2">
                                            <p className="font-medium tabular-nums text-right whitespace-nowrap text-gray-700">
                                                {formattedValue}
                                            </p>
                                        </div>
                                    </li>
                                )    
                            })}
                        </ul>
                    </div>
                )})}
            </div>
        )}
    </div>
)

export default ImplementationAndAccessTooltipContent