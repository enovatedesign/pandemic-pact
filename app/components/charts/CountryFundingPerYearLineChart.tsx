"use client"

import {Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Legend, Title, Tooltip, TooltipItem} from 'chart.js';
import {Line} from "react-chartjs-2";
import {millify} from "millify";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Legend, Title, Tooltip);

const data = {
    labels: [
        '2015',
        '2016',
        '2017',
    ],
    datasets: [
        {
            label: 'United States',
            borderColor: '#3e95cd',
            data: [
                Math.random() * 1000000000,
                Math.random() * 1000000000,
                Math.random() * 1000000000,
            ],
        },
        {
            label: 'United Kingdom',
            borderColor: '#8e5ea2',
            borderWidth: 1,
            data: [
                Math.random() * 1000000000,
                Math.random() * 1000000000,
                Math.random() * 1000000000,
            ],
        },
        {
            label: 'Germany',
            borderColor: '#3cba9f',
            borderWidth: 1,
            data: [
                Math.random() * 1000000000,
                Math.random() * 1000000000,
                Math.random() * 1000000000,
            ],
        },
    ],
};

const options = {
    plugins: {
        title: {
            display: true,
            text: 'Country Funding Per Year',
            font: {
                size: 24,
                weight: 'bold',
            },
        },
        tooltip: {
            callbacks: {
                label: (context: TooltipItem<"line">) => '$' + millify(context.parsed.y, {precision: 2}),
            },
        },
    },
};

export default function CountryFundingPerYearLineChart() {
    return <Line data={data} options={options} />;
}
