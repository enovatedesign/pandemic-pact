// This is a hack to get around the fact that the public types for react-simple-maps
// are incomplete and don't include the useZoomPanContext hook.

import * as ReactSimpleMaps from 'react-simple-maps'

declare module 'react-simple-maps' {
    export function useZoomPanContext(): {
        x: number
        y: number
        k: number
        transformString: string
    }
}
