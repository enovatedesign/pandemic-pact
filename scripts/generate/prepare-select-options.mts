import fs from 'fs-extra'
import {title, printWrittenFileStats} from '../helpers/log.mjs'
import {convertSourceKeysToOurKeys} from '../helpers/key-mapping.mjs'

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

    const pathname = `${path}/select-options.json`

    fs.writeJsonSync(pathname, convertSourceKeysToOurKeys(selectOptions))

    printWrittenFileStats(pathname)
}

function parseSelectOptionsFromChoices(choices: string) {
    return choices.split(' | ').map(choice => {
        const [id, ...rest] = choice.split(',')

        return {
            value: id.trim(),
            label: rest.join(',')
                .replace(/<[^>]*>?/gm, '') // remove html tags (if any)
                .trim()
        }
    })
}
