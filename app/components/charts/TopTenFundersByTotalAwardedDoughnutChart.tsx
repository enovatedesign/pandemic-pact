"use client"

import {Chart as ChartJS, ArcElement, Legend, Title, Tooltip, type TooltipItem} from "chart.js"
import {Doughnut} from "react-chartjs-2"
import {millify} from "millify"
import _ from "lodash"
import {type SearchResults} from '../../types/search-results'

import sourceData from '../../../data/dist/charts/top-ten-funders-by-total-awarded.json'

ChartJS.register(ArcElement, Title, Tooltip, Legend)

const options = {
    plugins: {
        title: {
            display: true,
            text: 'Top Ten Funders by Total Awarded',
            font: {
                size: 24,
                weight: 'bold',
            },
        },
        tooltip: {
            callbacks: {
                label: (context: TooltipItem<"doughnut">) => '$' + millify(context.parsed, {precision: 2}),
            },
        },
    },
}

export default function TopTenFundersByTotalAwardedDoughnutChart({searchResults}: {searchResults: SearchResults}) {
    const grantIdsMatchedBySearch = searchResults.map(result => result.GrantID)

    const filteredData = searchResults.length ?
        sourceData.filter(datum => grantIdsMatchedBySearch.includes(datum.GrantID))
        : sourceData

    const groupedFundersAndAmountsAwarded = _.groupBy(filteredData, 'FundingOrgName')

    const topTenFundersByTotalAwarded = _.map(groupedFundersAndAmountsAwarded, (group, FundingOrgName) => {
        const total = _.sumBy(group, 'GrantAmountConverted')

        return {
            funder: FundingOrgName,
            total,
        }
    }).sort((a, b) => b.total - a.total).slice(0, 10)

    const data = {
        labels: topTenFundersByTotalAwarded.map(datum => datum.funder),
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

    return <Doughnut data={data} options={options} />
}
