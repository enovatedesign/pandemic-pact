import { ReactNode } from 'react'
import {
    TrendingUpIcon,
    TrendingDownIcon,
    MinusIcon,
} from '@heroicons/react/solid'

interface TooltipContentItem {
    colour?: string
    label: string
    value: string
    bold?: boolean
    trend?: 'up' | 'down' | 'none'
    trendValueAmount?: number
}

interface Props {
    title?: string
    items?: TooltipContentItem[]
    footer?: ReactNode
}

export default function TooltipContent({ title, items, footer = null }: Props) {
    return (
        <div className="max-w-full md:max-w-none rounded-lg text-sm border bg-white opacity-100 shadow border-gray-100">
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
                                    className={`text-left ${
                                        item.bold
                                            ? 'font-bold text-gray-700'
                                            : 'text-gray-700'
                                    }`}
                                >
                                    {item.label}
                                </p>
                            </div>

                            <div className="flex justify-between items-center gap-x-2">
                                <p className="font-medium tabular-nums text-right whitespace-nowrap text-gray-700">
                                    {item.value}
                                </p>

                                {item.trend && (
                                    <>
                                        {item.trend === 'up' && (
                                            <TrendingUpIcon className="h-4 w-4 text-green-500" />
                                        )}

                                        {item.trend === 'down' && (
                                            <TrendingDownIcon className="h-4 w-4 text-red-500" />
                                        )}

                                        {item.trend === 'none' && (
                                            <MinusIcon className="h-4 w-4 text-gray-500" />
                                        )}
                                        
                                        {item.trendValueAmount && (
                                            <span>{item.trendValueAmount}</span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {footer}
        </div>
    )
}
