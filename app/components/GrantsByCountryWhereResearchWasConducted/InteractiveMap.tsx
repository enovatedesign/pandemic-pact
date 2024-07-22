import { useCallback, useMemo } from 'react'
import DeckGL from '@deck.gl/react'
import { GeoJsonLayer } from '@deck.gl/layers'
import { LinearInterpolator, OrthographicView } from '@deck.gl/core'
import type { PickingInfo } from '@deck.gl/core'
import { ColorTranslator } from 'colortranslator'

interface Props {
    geojson: any
    onMouseEnterOrMove: (
        position: { x: number; y: number },
        properties: any,
    ) => void
    onMouseLeave: () => void
    onClick: (properties: any) => void
}

export default function InteractiveMap({
    geojson,
    onMouseEnterOrMove,
    onMouseLeave,
    onClick,
}: Props) {
    const onLayerClick = useCallback(
        (info: PickingInfo) => {
            onClick(info.object?.properties ?? null)
        },
        [onClick],
    )

    const onLayerHover = useCallback(
        (info: PickingInfo) => {
            if (info.picked) {
                onMouseEnterOrMove(
                    {
                        x: info.x,
                        y: info.y,
                    },
                    info.object?.properties,
                )
            } else {
                onMouseLeave()
            }
        },
        [onMouseEnterOrMove, onMouseLeave],
    )

    const layer = useMemo(
        () =>
            new GeoJsonLayer<any>({
                id: 'GeoJsonLayer',
                data: geojson,

                filled: true,
                getFillColor: (f: any) => {
                    const colourTranslator = new ColorTranslator(
                        f.properties.colour,
                    )

                    return [
                        colourTranslator.R,
                        colourTranslator.G,
                        colourTranslator.B,
                    ]
                },

                stroked: true,
                getLineColor: [255, 255, 255],
                getLineWidth: 2,
                lineWidthUnits: 'pixels',
                pickable: true,
                modelMatrix: [1, 0, 0, 0, 0, 1.3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
                onClick: onLayerClick,
                onHover: onLayerHover,
            }),
        [geojson, onLayerClick, onLayerHover],
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

    const interpolator = useMemo(
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
                zoom: 1.0,
                transitionInterpolator: interpolator,
                target: [0, 10, 0],
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
