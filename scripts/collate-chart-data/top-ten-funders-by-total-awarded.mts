import fs from 'fs-extra'
import _ from 'lodash'
import chalk from 'chalk'
import {StringDictionary} from '../types/dictionary'

interface FundersAndAmountAwarded {
    funders: string;
    amount_awarded_converted_to_usd: number
}

interface FundersAndTotalAwarded {
    funders: string;
    total: number
}

interface DoughnutChartData {
    labels: Array<string>;
    datasets: Array<{
        data: Array<number>;
        backgroundColor: Array<string>;
    }>
}

const data: Array<StringDictionary> = fs.readJsonSync('./data/dist/complete-dataset.json')

const fundersAndAmountsAwarded: Array<FundersAndAmountAwarded> = data
    .filter(
        datum => datum.GrantAmountConverted)
    .map(
        datum => _.pick(
            datum,
            ['FundingOrgName', 'GrantAmountConverted']
        )
    )
    .map(datum => ({
        funders: datum.FundingOrgName,
        amount_awarded_converted_to_usd: parseFloat(datum.GrantAmountConverted)
    }))

const groupedFundersAndAmountsAwarded = _.groupBy(fundersAndAmountsAwarded, 'funders')

const topTenFundersByTotalAwarded: Array<FundersAndTotalAwarded> = _.map(groupedFundersAndAmountsAwarded, (group, funders) => {
    const total = _.sumBy(group, 'amount_awarded_converted_to_usd')

    return {
        funders,
        total,
    }
}).sort((a, b) => b.total - a.total).slice(0, 10)

const doughnutChartData: DoughnutChartData = {
    labels: topTenFundersByTotalAwarded.map(datum => datum.funders),
    datasets: [{
        data: topTenFundersByTotalAwarded.map(datum => datum.total),
        backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#16302B',
            '#36A2EB',
            '#A05C7B',
            '#F5E5E0',
            '#6096BA',
            '#250902',
            '#DD7230',
        ],
    }]
}

fs.ensureDir('./data/dist/charts')

fs.writeJsonSync('./data/dist/charts/top-ten-funders-by-total-awarded.json', doughnutChartData)

console.log(chalk.blue('Wrote ./data/dist/charts/top-ten-funders-by-total-awarded.json'))

