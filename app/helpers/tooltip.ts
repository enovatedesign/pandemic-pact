import { createContext, RefObject } from 'react'
import { TooltipRefProps } from 'react-tooltip'

/**
 * From React 19, `useRef<T>(null)` is typed `RefObject<T | null>` rather than
 * `RefObject<T>`, so the null has to be inside the RefObject for the providers to
 * type-check. The outer `| null` stays for the default value, which has no ref at all.
 */
export const TooltipContext = createContext<{
    tooltipRef: RefObject<TooltipRefProps | null> | null
}>({
    tooltipRef: null,
})

export const rechartBaseTooltipProps = {
    position:
        typeof window !== 'undefined' && window.innerWidth < 768
            ? { x: 0 }
            : undefined,
    isAnimationActive: false,
    wrapperStyle: { zIndex: 9999 },
}

export const sharedTooltipStyle = { zIndex: 60 }
