import fs from 'fs-extra'
import {read, utils} from 'xlsx'

type Row = {[key: string]: string}

const buffer = fs.readFileSync('./dictionary.csv')

const workbook = read(buffer, {raw: true})

const sheetName = workbook.SheetNames[0]

const sheet = workbook.Sheets[sheetName]

const data: Row[] = utils.sheet_to_json(sheet)

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

// console.log(selectOptions)
const row = checkBoxFields.find(row => row['Variable / Field Name'] === 'funder_name') as Row
const choices = row['Choices, Calculations, OR Slider Labels'].split('|')

fs.writeJsonSync('./choices.json', choices)

fs.writeJsonSync('./selectOptions.json', selectOptions)

function parseSelectOptionsFromChoices(choices: string) {
    return Object.fromEntries(
        choices.split('|').map(choice => {
            const [id, ...rest] = choice.split(',')

            return [
                id.trim(),
                rest.join(',').trim()
            ]
        })
    )
}
