interface TooltipContentItem {
    colour?: string
    label: string
    value: string
}

interface Props {
    title?: string
    items?: TooltipContentItem[]
}

export default function TooltipContent({ title, items }: Props) {
    return (
        <div className="rounded-lg text-sm border bg-white opacity-100 shadow border-gray-100 ">
            {title && (
                <div className="border-gray-100 border-b px-4 py-2">
                    <p className="font-medium text-gray-700">{title}</p>
                </div>
            )}

            {items && (
                <div className="px-4 py-2 space-y-1">
                    {items.map(item => (
                        <div className="flex items-center justify-between space-x-8">
                            <div className="flex items-center space-x-2">
                                {item.colour && (
                                    <span
                                        className="shrink-0 rounded-full border-2 h-3 w-3 border-white shadow"
                                        style={{ backgroundColor: item.colour }}
                                    />
                                )}

                                <p className="text-right whitespace-nowrap text-gray-400">
                                    {item.label}
                                </p>
                            </div>

                            <p className="font-medium tabular-nums text-right whitespace-nowrap text-gray-700">
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
