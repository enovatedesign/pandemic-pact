import fs from 'fs-extra'
import {read, utils} from 'xlsx'

const buffer = fs.readFileSync('./data.csv')

const workbook = read(buffer, {
    raw: true,
})

const sheetName = workbook.SheetNames[0]

const sheet = workbook.Sheets[sheetName]

const data = utils.sheet_to_json(sheet)

fs.writeJsonSync('./data.json', data)
