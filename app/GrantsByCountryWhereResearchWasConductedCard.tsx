import {Flex, Card, Title, } from "@tremor/react"
import {ComposableMap, Geographies, Geography, Graticule, Sphere} from 'react-simple-maps'
import countriesGeoJson from '../data/source/geojson/countries.json'

export default function GrantsByCountryWhereResearchWasConducted() {
    return (
        <Card>
            <Flex
                flexDirection="col"
                alignItems="start"
                className="gap-y-6"
            >
                <Flex
                    justifyContent="between"
                    alignItems="center"
                >
                    <Title>Grants By Country Where Research Was Conducted</Title>
                </Flex>

                <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{
                        scale: 130,
                    }}
                    style={{
                        borderRadius: 4,
                        border: "1px solid #D6D6DA",
                    }}
                >
                    <Geographies geography={countriesGeoJson}>
                        {({geographies}) =>
                            geographies.map((geo) => (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill="#D6D6DA"
                                    stroke="#FFFFFF"
                                    strokeWidth={1}
                                />
                            ))
                        }
                    </Geographies>
                </ComposableMap>
            </Flex>
        </Card>
    )
}
