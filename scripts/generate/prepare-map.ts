import fs from 'fs-extra'
import { execSync } from 'child_process'
import _ from 'lodash'

// This script generates two GeoJSON files for the map visualisation: one for countries
// and one for WHO regions. Features in both files will have a single `id` property. In
// the countries file, this is the Country value, and in the WHO regions file,
// this is the WHO Region value.
// Mapshaper docs: https://github.com/mbloch/mapshaper/wiki
export default async function prepareMap() {
    fs.ensureDirSync('./data/dist/geojson')

    // Merge the Somalia and Somaliland features into a single feature,
    // merge the Ukraine MultiPolygon (which contains Ukraine and the Crimean Peninsula)
    // into a single Polygon, and write to an intermediate GeoJSON file
    execSync(`
        npx mapshaper ./data/source/geojson/ne_110m_admin_0_countries.json \
            -dissolve copy-fields=ISO_N3_EH where='SOVEREIGNT === "Somalia" || SOVEREIGNT === "Somaliland"' \
            -dissolve copy-fields=ISO_N3_EH where='SOVEREIGNT === "Ukraine"' \
            -o gj2008 format=geojson ./data/dist/geojson/countries.json
    `)

    const inputGeojson = fs.readJsonSync('./data/dist/geojson/countries.json')

    const regionToCountryMapping: { [key: string]: string[] } = fs.readJsonSync(
        './data/source/region-to-country-mapping.json',
    )

    const countriesGeojson = _.pick(inputGeojson, ['type', 'features', 'bbox'])

    // Replace all the ISO_N3_EH properties with a corresponding Country value from 
    // our dataset, and a WHO Region value from the region-to-country mapping
    countriesGeojson.features = countriesGeojson.features.map(
        (feature: { type: string; properties: { ISO_N3_EH: string } }) => {
            // Remove leading zeroes from the ISO_N3_EH property because in our 
            // data set it is a number, not a string
            const id = feature.properties.ISO_N3_EH.replace(/^0+/, '')

            // Use the region-to-country mapping to determine which region
            // this country belongs to
            const who_region_id = Object.entries(regionToCountryMapping).find(
                ([_, countries]) => countries.includes(id),
            )?.[0]

            // Replace the properties on the existing GeoJSON with our new ones
            return {
                ...feature,
                properties: {
                    id,
                    who_region_id,
                },
            }
        },
    )

    fs.ensureDirSync('./public/data/geojson')

    fs.writeJsonSync('./public/data/geojson/countries.json', countriesGeojson)

    // Merge countries into WHO regions and write to a separate GeoJSON file
    execSync(`
        npx mapshaper ./public/data/geojson/countries.json \
            -dissolve who_region_id copy-fields=who_region_id \
            -each 'id=who_region_id, delete who_region_id' \
            -o gj2008 format=geojson ./public/data/geojson/who-regions.json
    `)
}
