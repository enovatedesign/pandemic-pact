"use client"

import {useEffect, useRef} from 'react';
import {Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Legend, Title, Tooltip, TooltipItem} from 'chart.js';
import {Line} from "react-chartjs-2";
import {millify} from "millify";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Legend, Title, Tooltip);

export default function CountryFundingPerYearLineChart() {
    const data = {
        labels: [
            '2015',
            '2016',
            '2017',
        ],
        datasets: [
            {
                label: 'United States',
                borderColor: 'red',
                borderWidth: 3,
                data: [
                    Math.random() * 1000000000,
                    Math.random() * 1000000000,
                    Math.random() * 1000000000,
                ],
            },
            {
                label: 'United Kingdom',
                borderColor: 'darkblue',
                borderWidth: 3,
                data: [
                    Math.random() * 1000000000,
                    Math.random() * 1000000000,
                    Math.random() * 1000000000,
                ],
            },
            {
                label: 'Germany',
                borderColor: 'black',
                borderWidth: 3,
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
            legend: {
                labels: {
                    usePointStyle: true,
                },
            },
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

    const chartRef = useRef<ChartJS>(null);

    useEffect(() => {
        const chart = chartRef.current;

        if (!chart) {
            return;
        }

        const pointImageWidth = 15;

        const gbFlag = new Image(pointImageWidth, pointImageWidth);
        gbFlag.src = '/country-flags/gb.svg';

        const usFlag = new Image(pointImageWidth, pointImageWidth);
        usFlag.src = '/country-flags/us.svg';

        const deFlag = new Image(pointImageWidth, pointImageWidth);
        deFlag.src = '/country-flags/de.svg';

        chart.data.datasets[0].pointStyle = usFlag;
        chart.data.datasets[1].pointStyle = gbFlag;
        chart.data.datasets[2].pointStyle = deFlag;

        chart.update();
    }, []);

    return <Line ref={chartRef} data={data} options={options} />;
}
