"use client"

import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

import data from '../../../data/dist/charts/topTenFundersByTotalAwarded.json'

ChartJS.register(ArcElement, Tooltip);

export default function TopTenFundersByTotalAwardedDoughnutChart() {
    return <Doughnut data={data} />
}
