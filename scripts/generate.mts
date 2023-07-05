import fs from 'fs-extra'
import _ from 'lodash'
import type {Dictionary} from './types/Dictionary'

const data: Array<Dictionary> = fs.readJsonSync('./data/dist/data.json');

interface FundersAndAmountAwarded {
    funders: string;
    amount_awarded_converted_to_usd: number
};

const moreData: Array<FundersAndAmountAwarded> = data
    .filter(
        d => d.amount_awarded_converted_to_usd)
    .map(
        d => _.pick(
            d,
            ['funders', 'amount_awarded_converted_to_usd']
        )
    )
    .map(d => ({
        funders: d.funders,
        amount_awarded_converted_to_usd: parseFloat(d.amount_awarded_converted_to_usd)
    }));

const grouped = _.groupBy(moreData, 'funders');

interface FundersAndTotalAwarded {
    funders: string;
    total: number
};

const topTenFundersByTotalAwarded: Array<FundersAndTotalAwarded> = _.map(grouped, (group, funders) => {
    const total = _.sumBy(group, 'amount_awarded_converted_to_usd');

    return {
        funders,
        total,
    }
}).sort((a, b) => b.total - a.total).slice(0, 10);

interface DoughnutChartData {
    labels: Array<string>;
    datasets: Array<{
        data: Array<number>;
        backgroundColor: Array<string>;
    }>
};

const doughnutChartData: DoughnutChartData = {
    labels: topTenFundersByTotalAwarded.map(d => d.funders),
    datasets: [{
        data: topTenFundersByTotalAwarded.map(d => d.total),
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
