import { ReactNode } from 'react'

interface TooltipContentItem {
    colour?: string
    label: string
    value: string
    bold?: boolean
}

interface Props {
    title?: string
    items?: TooltipContentItem[]
    footer?: ReactNode
}

export default function TooltipContent({ title, items, footer = null }: Props) {
    return (
        <div className="rounded-lg text-sm border bg-white opacity-100 shadow border-gray-100 ">
            {title && (
                <div className="border-gray-100 border-b px-4 py-2">
                    <p className="font-medium text-gray-700">{title}</p>
                </div>
            )}

            {items && (
                <div className="px-4 py-2 space-y-1">
                    {items.map((item: TooltipContentItem, index: number) => (
                        <div
                            className="flex items-center justify-between space-x-8"
                            key={index}
                        >
                            <div className="flex items-center space-x-2">
                                {item.colour && (
                                    <span
                                        className="shrink-0 rounded-full border-2 h-3 w-3 border-white shadow"
                                        style={{ backgroundColor: item.colour }}
                                    />
                                )}

                                <p
                                    className={`text-right whitespace-nowrap ${
                                        item.bold
                                            ? 'font-bold text-gray-600'
                                            : 'text-gray-400'
                                    }`}
                                >
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

            {footer}
        </div>
    )
}
