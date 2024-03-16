import fs from 'fs-extra'
import _ from 'lodash'

export default async function () {
    const inputGeojson = fs.readJsonSync(
        './data/source/geojson/ne_110m_admin_0_countries.json'
    )

    // TODO determine whether we need bbox property here and in features
    const outputGeojson = _.pick(inputGeojson, ['type', 'features', 'bbox'])

    outputGeojson.features = outputGeojson.features.map(
        (feature: {
            type: string
            properties: { NAME: string; ISO_N3_EH: string }
        }) => {
            return {
                ...feature,
                properties: {
                    name: feature.properties.NAME,
                    iso_code: feature.properties.ISO_N3_EH.replace(/^0+/, ''),
                },
            }
        }
    )

    fs.writeJsonSync('./public/data/world.geojson', outputGeojson)
}
