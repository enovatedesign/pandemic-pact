import { createContext, RefObject } from 'react'
import { TooltipRefProps } from 'react-tooltip'

export const TooltipContext = createContext<{
    tooltipRef: RefObject<TooltipRefProps> | null
}>({
    tooltipRef: null,
})

export const rechartBaseTooltipProps = {
    position:
        typeof window !== 'undefined' && window.innerWidth < 768
            ? { x: 0 }
            : undefined,
    isAnimationActive: false,
}
