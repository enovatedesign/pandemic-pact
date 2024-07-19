'use client'

import { useCallback, useMemo, useState } from 'react'
import Map, { Source, Layer } from 'react-map-gl/maplibre'
import type { FillLayer, MapLayerMouseEvent } from 'react-map-gl/maplibre'
import geojson from '../../public/data/geojson/countries.json'
import 'maplibre-gl/dist/maplibre-gl.css'

export default function Page() {
    const [cursor, setCursor] = useState<string>('auto')

    const fillLayer: FillLayer = {
        id: 'my-data',
        type: 'fill',
        source: 'geojson',
        paint: {
            'fill-color': ['get', 'colour'],
        },
    }

    const colouredGeojson = useMemo(
        () => ({
            ...geojson,
            features: geojson.features.map(feature => ({
                ...feature,
                properties: {
                    ...feature.properties,
                    colour: getRandomColor(),
                },
            })),
        }),
        [geojson],
    )

    const onClick = useCallback((event: MapLayerMouseEvent) => {
        const feature = event.features && event.features[0]
        console.log('event', feature)

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
                interactiveLayerIds={['my-data']}
            >
                <Source id="my-data" type="geojson" data={colouredGeojson}>
                    <Layer {...fillLayer} />
                </Source>
            </Map>
        </>
    )
}

function getRandomColor() {
    // Generate a random number between 0 and 16777215 (which is 0xFFFFFF)
    const randomColor = Math.floor(Math.random() * 16777215)

    // Convert the random number to a hexadecimal string and pad it with leading zeros if necessary
    const hexColor = `#${randomColor.toString(16).padStart(6, '0')}`

    return hexColor
}

