import { useCallback, useMemo } from 'react'
import DeckGL from '@deck.gl/react'
import { GeoJsonLayer } from '@deck.gl/layers'
import { LinearInterpolator, OrthographicView } from '@deck.gl/core'
import type { PickingInfo } from '@deck.gl/core'
import type { FeatureProperties } from './types'

interface Props {
    geojson: any
    onClick: (properties: FeatureProperties) => void
}

export default function InteractiveMap({ geojson, onClick }: Props) {
    const onLayerClick = useCallback(
        (info: PickingInfo) => {
            onClick(info.object?.properties ?? null)
        },
        [onClick],
    )

    const getCursor = useCallback(
        ({
            isDragging,
            isHovering,
        }: {
            isDragging: boolean
            isHovering: boolean
        }) => {
            if (isHovering) {
                return 'pointer'
            } else if (isDragging) {
                return 'move'
            } else {
                return 'auto'
            }
        },
        [],
    )

    const layer = useMemo(
        () =>
            new GeoJsonLayer<any>({
                id: 'GeoJsonLayer',
                data: geojson,
                filled: true,
                getFillColor: (feature: any) => feature.properties.fillColour,
                stroked: true,
                getLineColor: [255, 255, 255],
                lineWidthScale: 1.25,
                lineWidthUnits: 'pixels',
                pickable: true,
                modelMatrix: [1, 0, 0, 0, 0, 1.2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
                onClick: onLayerClick,
            }),
        [geojson, onLayerClick],
    )

    const view = useMemo(
        () =>
            new OrthographicView({
                id: 'orthographic-view',
                flipY: false,
                controller: true,
            }),
        [],
    )

    const transitionInterpolator = useMemo(
        () => new LinearInterpolator(['target', 'zoom']),
        [],
    )

    return (
        <DeckGL
            width="100%"
            height={450}
            style={{ position: 'relative' }}
            views={view}
            initialViewState={{
                zoom: 1.25,
                transitionInterpolator,
                target: [0, 15, 0],
            }}
            controller={{
                dragRotate: false,
                touchRotate: false,
                keyboard: false,
            }}
            layers={[layer]}
            getCursor={getCursor}
        />
    )
}
