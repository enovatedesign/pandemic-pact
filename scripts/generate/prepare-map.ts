import fs from 'fs-extra'
import { execSync } from 'child_process'
import _ from 'lodash'

export default async function () {
    const inputGeojson = fs.readJsonSync(
        './data/source/geojson/ne_110m_admin_0_countries.json'
    )

    const regionToCountryMapping: { [key: string]: string[] } = fs.readJsonSync(
        './data/source/region-to-country-mapping.json'
    )

    const countriesGeojson = _.pick(inputGeojson, ['type', 'features', 'bbox'])

    countriesGeojson.features = countriesGeojson.features.map(
        (feature: { type: string; properties: { ISO_N3_EH: string } }) => {
            const id = feature.properties.ISO_N3_EH.replace(/^0+/, '')

            const who_region_id = Object.entries(regionToCountryMapping).find(
                ([_, countries]) => countries.includes(id)
            )?.[0]

            return {
                ...feature,
                properties: {
                    id,
                    who_region_id,
                },
            }
        }
    )

    fs.ensureDirSync('./public/data/geojson')

    fs.writeJsonSync('./public/data/geojson/countries.json', countriesGeojson)

    execSync(`
        npx mapshaper ./public/data/geojson/countries.json \
            -dissolve who_region_id copy-fields=who_region_id \
            -each 'id=who_region_id, delete who_region_id' \
            -clean \
            -o fix-geometry gj2008 format=geojson ./public/data/geojson/who-regions.json
    `)
}
