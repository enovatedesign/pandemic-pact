'use client'

import { useCallback, useMemo } from 'react'
import DeckGL from '@deck.gl/react'
import { GeoJsonLayer } from '@deck.gl/layers'
import { LinearInterpolator, OrthographicView } from '@deck.gl/core'
import type { PickingInfo } from '@deck.gl/core'

interface Props {
    geojson: any // TODO type
    setSelectedCountry: (country: string | null) => void
}

export default function InteractiveMap({ geojson, setSelectedCountry }: Props) {
    const onClick = useCallback(
        (info: PickingInfo) => {
            setSelectedCountry(info.object?.properties.id ?? null)
        },
        [setSelectedCountry],
    )

    const onHover = useCallback((info: PickingInfo) => {
        console.log('hover', info)
    }, [])

    const layer = useMemo(
        () =>
            new GeoJsonLayer<any>({
                id: 'GeoJsonLayer',
                data: geojson,

                filled: true,
                getFillColor: (f: any) => f.properties.colour,

                stroked: true,
                getLineColor: [255, 255, 255],
                getLineWidth: 2,
                lineWidthUnits: 'pixels',
                pickable: true,
                modelMatrix: [1, 0, 0, 0, 0, 1.2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
                onClick,
                onHover,
            }),
        [geojson, setSelectedCountry],
    )

    const view = useMemo(
        () =>
            new OrthographicView({
                id: 'orthographic-view',
                width: 1000,
                height: 1000,
                flipY: false,
                controller: true,
            }),
        [],
    )

    const interpolator = useMemo(
        () => new LinearInterpolator(['target', 'zoom']),
        [],
    )

    return (
        <DeckGL
            width={1000}
            height={1000}
            style={{ position: 'relative' }}
            views={view}
            initialViewState={{
                zoom: 1,
                transitionInterpolator: interpolator,
                target: [0, 0, 0],
            }}
            controller={{
                dragRotate: false,
                touchRotate: false,
                keyboard: false,
            }}
            layers={[layer]}
        />
    )
}
