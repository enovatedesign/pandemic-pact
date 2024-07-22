'use client'

import DeckGL from '@deck.gl/react'
import { GeoJsonLayer } from '@deck.gl/layers'
import type { PickingInfo } from '@deck.gl/core'

interface Props {
    geojson: any // TODO type
    setSelectedCountry: (country: string | null) => void
}

export default function InteractiveMap({ geojson, setSelectedCountry }: Props) {
    const layer = new GeoJsonLayer<any>({
        id: 'GeoJsonLayer',
        data: geojson,

        filled: true,
        getFillColor: (f: any) => f.properties.colour,

        stroked: true,
        getLineColor: [255, 255, 255],
        getLineWidth: 2,
        lineWidthUnits: 'pixels',
        pickable: true,
        onClick: (info: PickingInfo) => {
            setSelectedCountry(info.object?.properties.id ?? null)
        },
    })

    return (
        <DeckGL
            initialViewState={{
                longitude: 0,
                latitude: 0,
                zoom: 1,
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
