import { useCallback, useContext, useMemo, useState } from 'react'
import DeckGL from '@deck.gl/react'
import { GeoJsonLayer } from '@deck.gl/layers'
import { LinearInterpolator, OrthographicView, OrthographicViewState } from '@deck.gl/core'
import type { PickingInfo } from '@deck.gl/core'
import { RefreshIcon } from '@heroicons/react/solid'
import { DeckGLRefContext } from '../../../helpers/deck-gl'

interface Props {
    geojson: any
    onClick: (featureId: string | null) => void
}

export default function InteractiveMap({
    geojson,
    onClick,
}: Props) {
    const deckGlRef = useContext(DeckGLRefContext)

    const onLayerClick = useCallback(
        (info: PickingInfo) => {
            onClick(info.object?.properties.id ?? null)
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
            new GeoJsonLayer({
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

    const INITIAL_VIEW_STATE: OrthographicViewState = useMemo(
        () => ({
            zoom: 1.25,
            target: [0, 15, 0],
            minZoom: 1,
            transitionInterpolator,
        }),
        [transitionInterpolator]
    )

    const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

    const hasViewStateChanged = useCallback(() => {
        return (
            viewState.zoom !== INITIAL_VIEW_STATE.zoom ||
            viewState.target !== INITIAL_VIEW_STATE.target
        );
    }, [viewState, INITIAL_VIEW_STATE]);

    return (
        <div className="relative">
            <DeckGL
                width="100%"
                height={450}
                style={{ position: 'relative' }}
                views={view}
                initialViewState={viewState}
                onViewStateChange={({ viewState }) => setViewState(viewState)}
                controller={{
                    dragRotate: false,
                    touchRotate: false,
                    keyboard: false,
                }}
                layers={[layer]}
                getCursor={getCursor}
                ref={ref => {
                    if (deckGlRef) {
                        deckGlRef.current = ref
                    }
                }}
            />
            {hasViewStateChanged() && (<button 
                onClick={() => setViewState(INITIAL_VIEW_STATE)}
                className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-white border border-gray-200 shadow">
                    <RefreshIcon className="size-4" aria-hidden="true" /> Reset Map
            </button>)}
        </div>
    )
}
