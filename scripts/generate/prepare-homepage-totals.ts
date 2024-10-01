import fs from 'fs-extra'
import _ from 'lodash'
import { Grant } from '../types/generate'
import { title, info, printWrittenFileStats } from '../helpers/log'
import { millify } from 'millify'

export default function () {
    title('Preparing homepage totals')

    const grants: Grant[] = fs.readJsonSync('./data/dist/grants.json')

    // Calculate and format the total amount of funding in USD
    const rawTotalCommittedUsd = _.sumBy(grants, 'GrantAmountConverted')

    const units = [
        '',
        'thousand',
        'million',
        'billion',
        'trillion',
        'quadrillion',
        'quintillion',
        'sextillion',
    ]

    const formattedTotalCommittedUsd = millify(rawTotalCommittedUsd, {
        units,
        precision: 0,
    })

    // Separate the string returned by millify into a number and a suffix
    const totalCommittedUsd = {
        finalCount: parseInt(formattedTotalCommittedUsd),
        // This regex removes all non-alphabetic characters from the string
        suffix: ' ' + formattedTotalCommittedUsd.replace(/[^a-z]/g, ''),
    }

    // Calculate the total number of grants
    const totalGrants = { finalCount: grants.length }

    // Calculate the total number of funders. Note that we don't use the select
    // options for this, because some of those funders may not actually have any
    // grants associated with them.
    const totalFunders = {
        finalCount: _.uniq(
            grants.map(grant => grant.FundingOrgName).flat()
        ).length,
    }

    // Log the totals
    info(
        `Total amount (USD): ${totalCommittedUsd.finalCount} ${totalCommittedUsd.suffix}`
    )
    info(`Total number of grants: ${totalGrants.finalCount}`)
    info(`Total number of funders: ${totalFunders.finalCount}`)

    // Write the totals to a file
    const totals = {
        totalCommittedUsd,
        totalGrants,
        totalFunders,
    }

    const pathname = './data/dist/homepage-totals.json'

    fs.writeJsonSync(pathname, totals)

    printWrittenFileStats(pathname)
}
