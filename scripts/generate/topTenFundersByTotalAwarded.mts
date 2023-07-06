import fs from 'fs-extra'
import _ from 'lodash'
import type {StringDictionary} from '../types/Dictionaries'

interface FundersAndAmountAwarded {
    funders: string;
    amount_awarded_converted_to_usd: number
};

interface FundersAndTotalAwarded {
    funders: string;
    total: number
};

interface DoughnutChartData {
    labels: Array<string>;
    datasets: Array<{
        data: Array<number>;
        backgroundColor: Array<string>;
    }>
};

const data: Array<StringDictionary> = fs.readJsonSync('./data/dist/data.json');

const fundersAndAmountsAwarded: Array<FundersAndAmountAwarded> = data
    .filter(
        datum => datum.amount_awarded_converted_to_usd)
    .map(
        datum => _.pick(
            datum,
            ['funders', 'amount_awarded_converted_to_usd']
        )
    )
    .map(datum => ({
        funders: datum.funders,
        amount_awarded_converted_to_usd: parseFloat(datum.amount_awarded_converted_to_usd)
    }));

const groupedFundersAndAmountsAwarded = _.groupBy(fundersAndAmountsAwarded, 'funders');

const topTenFundersByTotalAwarded: Array<FundersAndTotalAwarded> = _.map(groupedFundersAndAmountsAwarded, (group, funders) => {
    const total = _.sumBy(group, 'amount_awarded_converted_to_usd');

    return {
        funders,
        total,
    }
}).sort((a, b) => b.total - a.total).slice(0, 10);

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
};

fs.ensureDir('./data/dist/charts');

fs.writeJsonSync('./data/dist/charts/topTenFundersByTotalAwarded.json', doughnutChartData);

console.log('topTenFundersByTotalAwarded.json written to ./data/dist/charts');
