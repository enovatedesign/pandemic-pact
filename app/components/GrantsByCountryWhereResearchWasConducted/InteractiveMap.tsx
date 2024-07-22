import { useEffect, useState } from 'react'
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
    onGeoMouseEnterOrMove: (event: any, geo: any) => void
    onGeoMouseLeave: () => void
    onGeoClick: (geo: any) => void
}

export default function InteractiveMap({
    geojson,
    onGeoMouseEnterOrMove,
    onGeoMouseLeave,
    onGeoClick,
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

function InnerMap({
    geojson,
    onGeoMouseEnterOrMove,
    onGeoMouseLeave,
    onGeoClick,
}: Props) {
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
