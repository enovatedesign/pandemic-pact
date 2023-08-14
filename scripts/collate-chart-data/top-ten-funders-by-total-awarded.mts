import fs from 'fs-extra'
import chalk from 'chalk'
import {StringDictionary} from '../types/dictionary'
import getHumanReadableFileSize from '../utils/getHumanReadableFileSize.mjs'

interface GrantWithFunderAndAmountAwarded {
    GrantID: string
    FundingOrgName: string
    GrantAmountConverted: number
}

const completeDataset: Array<StringDictionary> = fs.readJsonSync('./data/dist/complete-dataset.json')

const chartData: Array<GrantWithFunderAndAmountAwarded> = completeDataset
    .filter(
        datum => datum.GrantAmountConverted
    )
    .map(
        datum => ({
            GrantID: datum.GrantID,
            FundingOrgName: datum.FundingOrgName,
            GrantAmountConverted: parseFloat(datum.GrantAmountConverted)
        })
    )

const directory = './data/dist/charts'

const filename = 'top-ten-funders-by-total-awarded.json'

const pathname = `${directory}/${filename}`

fs.ensureDir(directory)

fs.writeJsonSync(pathname, chartData)

const fileSize = getHumanReadableFileSize(pathname)

console.log(chalk.blue(`Wrote ${pathname} [${fileSize}]`))

