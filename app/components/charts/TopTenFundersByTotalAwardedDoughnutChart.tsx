"use client"

import {Chart as ChartJS, ArcElement, Legend, Tooltip, type TooltipItem} from "chart.js";
import {Doughnut} from "react-chartjs-2";
import {millify} from "millify";

import data from '../../../data/dist/charts/topTenFundersByTotalAwarded.json'

ChartJS.register(ArcElement, Tooltip, Legend);

const options = {
    plugins: {
        tooltip: {
            callbacks: {
                label: (context: TooltipItem<"doughnut">) => '$' + millify(context.parsed, {precision: 2}),
            },
        },
    },
};

export default function TopTenFundersByTotalAwardedDoughnutChart() {
    return <Doughnut data={data} options={options} />
}
