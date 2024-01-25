import {createContext, RefObject} from 'react'
import {TooltipRefProps} from 'react-tooltip'

export const TooltipContext = createContext<{
    tooltipRef: RefObject<TooltipRefProps> | null
}>({
    tooltipRef: null,
})

export const baseTooltipProps = {
    wrapperClassName: 'max-w-full md:max-w-none',
    itemStyle: { whiteSpace: 'pre-wrap' },
    position: typeof window !== 'undefined' && window.innerWidth < 768 ? { x: 0 } : undefined,
}
