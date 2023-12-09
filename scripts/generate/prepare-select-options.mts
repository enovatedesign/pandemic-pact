import fs from 'fs-extra'
import {getHumanReadableFileSize} from '../helpers/files.mjs'
import {title, info, newline} from '../helpers/log.mjs'

type Row = {[key: string]: string}

export default function () {
    title('Generating select options')

    const data: Row[] = fs.readJsonSync('./data/download/dictionary.json')

    const checkBoxFields = data.filter(
        row => row['Field Type'] === 'checkbox'
    )

    const selectOptions = Object.fromEntries(
        checkBoxFields.map(
            row => ([
                row['Variable / Field Name'],
                parseSelectOptionsFromChoices(row['Choices, Calculations, OR Slider Labels'])
            ])
        )
    )

    const path = './data/dist'

    fs.ensureDirSync(path)

    const pathname = `${path}/selectOptions.json`

    fs.writeJsonSync(pathname, selectOptions)

    info(`Wrote file ${pathname} (${getHumanReadableFileSize(pathname)})`)

    newline()
}

function parseSelectOptionsFromChoices(choices: string) {
    return Object.fromEntries(
        choices.split(' | ').map(choice => {
            const [id, ...rest] = choice.split(',')

            return [
                id.trim(),
                rest.join(',')
                    .replace(/<[^>]*>?/gm, '') // remove html tags (if any)
                    .trim()
            ]
        })
    )
}
