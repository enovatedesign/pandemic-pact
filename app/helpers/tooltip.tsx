import {createContext, RefObject} from 'react'
import {TooltipRefProps} from 'react-tooltip'

export const TooltipContext = createContext<{
    tooltipRef: RefObject<TooltipRefProps> | null
}>({
    tooltipRef: null,
})
