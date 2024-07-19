'use client'

import { useCallback, useState } from 'react'
import Map, { Source, Layer } from 'react-map-gl/maplibre'
import type {
    FillLayer,
    LineLayer,
    MapLayerMouseEvent,
} from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'

interface Props {
    geojson: any // TODO type
    setSelectedCountry: (country: string | null) => void
}

export default function InteractiveMap({ geojson, setSelectedCountry }: Props) {
    const [cursor, setCursor] = useState<string>('auto')

    const fillLayer: FillLayer = {
        id: 'fill-layer',
        type: 'fill',
        source: 'geojson',
        paint: {
            'fill-color': ['get', 'colour'],
        },
    }

    const lineLayer: LineLayer = {
        id: 'line-layer',
        type: 'line',
        source: 'geojson',
        paint: {
            'line-color': '#FFFFFF', // Set the outline color (black in this case)
            'line-width': 2,
        },
    }

    const onClick = useCallback(
        (event: MapLayerMouseEvent) => {
            const feature = event.features && event.features[0]

            const id = feature?.properties?.id

            setSelectedCountry(id ?? null)
        },
        [setSelectedCountry],
    )

    const onMouseEnter = useCallback(() => setCursor('pointer'), [])
    const onMouseLeave = useCallback(() => setCursor('auto'), [])

    return (
        <>
            <Map
                initialViewState={{
                    zoom: 1,
                }}
                style={{ width: 1500, height: 1000 }}
                cursor={cursor}
                onClick={onClick}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                interactiveLayerIds={['fill-layer']}
                attributionControl={false}
            >
                <Source id="geojson-source" type="geojson" data={geojson}>
                    <Layer {...fillLayer} />
                    <Layer {...lineLayer} />
                </Source>
            </Map>
        </>
    )
}
