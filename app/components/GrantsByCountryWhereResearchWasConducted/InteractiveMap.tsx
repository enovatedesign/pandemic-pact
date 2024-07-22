import { useCallback, useEffect, useState, MouseEvent } from 'react'
import { debounce } from 'lodash'
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup,
    useZoomPanContext,
} from 'react-simple-maps'

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
    const [height, setHeight] = useState(450)
    const [scale, setScale] = useState(200)

    useEffect(() => {
        const handleHeight = () => {
            if (window.innerWidth > 1024) {
                setHeight(350)
                setScale(125)
            } else {
                setHeight(450)
                setScale(200)
            }
        }

        const debouncedHandleHeight = debounce(handleHeight, 200)

        debouncedHandleHeight()

        window.addEventListener('resize', debouncedHandleHeight)

        return () => {
            window.removeEventListener('resize', debouncedHandleHeight)
        }
    })

    const onGeoMouseEnterOrMove = useCallback(
        (event: MouseEvent<SVGPathElement>, geo: any) => {
            onMouseEnterOrMove(
                { x: event.clientX, y: event.clientY },
                geo.properties,
            )
        },
        [onMouseEnterOrMove],
    )

    const onGeoClick = useCallback(
        (geo: any) => {
            onClick(geo.properties)
        },
        [onClick],
    )

    const onGeoMouseLeave = useCallback(() => {
        onMouseLeave()
    }, [onMouseLeave])

    const center: [number, number] = [20, 10]

    return (
        <ComposableMap
            projection="geoNaturalEarth1"
            projectionConfig={{
                scale,
                center,
            }}
            height={height}
        >
            <ZoomableGroup center={center}>
                <InnerMap
                    geojson={geojson}
                    onGeoMouseEnterOrMove={onGeoMouseEnterOrMove}
                    onGeoMouseLeave={onGeoMouseLeave}
                    onGeoClick={onGeoClick}
                />
            </ZoomableGroup>
        </ComposableMap>
    )
}

interface InnerMapProps {
    geojson: any
    onGeoMouseEnterOrMove: (event: MouseEvent<SVGPathElement>, geo: any) => void
    onGeoMouseLeave: () => void
    onGeoClick: (geo: any) => void
}

function InnerMap({
    geojson,
    onGeoMouseEnterOrMove,
    onGeoMouseLeave,
    onGeoClick,
}: InnerMapProps) {
    const zoomContext = useZoomPanContext()

    return (
        <Geographies geography={geojson}>
            {({ geographies }) =>
                geographies.map(geo => (
                    <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={geo.properties.colour}
                        stroke="#FFFFFF"
                        strokeWidth={1.0 / zoomContext.k}
                        className="cursor-pointer"
                        onClick={() => onGeoClick(geo)}
                        onMouseEnter={event =>
                            onGeoMouseEnterOrMove(event, geo)
                        }
                        onMouseMove={event => onGeoMouseEnterOrMove(event, geo)}
                        onMouseLeave={onGeoMouseLeave}
                    />
                ))
            }
        </Geographies>
    )
}
