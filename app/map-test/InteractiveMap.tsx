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
}

export default function InteractiveMap({ geojson }: Props) {
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

    const onClick = useCallback((event: MapLayerMouseEvent) => {
        const feature = event.features && event.features[0]

        if (feature) {
            window.alert(`Clicked layer ${feature.layer.id}`) // eslint-disable-line no-alert
        }
    }, [])

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
            >
                <Source id="geojson-source" type="geojson" data={geojson}>
                    <Layer {...fillLayer} />
                    <Layer {...lineLayer} />
                </Source>
            </Map>
        </>
    )
}
