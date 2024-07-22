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
            }),
        [geojson, setSelectedCountry],
    )

    const view = useMemo(
        () =>
            new OrthographicView({
                id: 'orthographic-view',
                width: 2000,
                height: 2000,
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
            views={view}
            initialViewState={{
                zoom: 2,
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
