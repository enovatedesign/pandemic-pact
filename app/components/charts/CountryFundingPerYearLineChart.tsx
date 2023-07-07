"use client"

import {useEffect, useRef} from 'react';
import {Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Legend, Title, Tooltip, TooltipItem} from 'chart.js';
import {Line} from "react-chartjs-2";
import {millify} from "millify";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Legend, Title, Tooltip);

const pointSize = 18;

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
                iso2Code: 'us',
                borderColor: 'rgba(0, 0, 255, 0.5)',
                data: [
                    Math.random() * 1000000000,
                    Math.random() * 1000000000,
                    Math.random() * 1000000000,
                ],
            },
            {
                label: 'United Kingdom',
                iso2Code: 'gb',
                borderColor: 'rgba(255, 0, 0, 0.5)',
                data: [
                    Math.random() * 1000000000,
                    Math.random() * 1000000000,
                    Math.random() * 1000000000,
                ],
            },
            {
                label: 'Germany',
                iso2Code: 'de',
                borderColor: 'rgba(0, 0, 0, 0.5)',
                data: [
                    Math.random() * 1000000000,
                    Math.random() * 1000000000,
                    Math.random() * 1000000000,
                ],
            },
        ],
    };

    const options = {
        borderWidth: 2,
        borderDash: [5, 5],
        cubicInterpolationMode: 'monotone',
        tension: 0.1,
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

        chart.data.datasets.forEach((dataset) => {
            const image = new Image(pointSize, pointSize);
            image.src = `/country-flags/${dataset.iso2Code}.svg`;
            dataset.pointStyle = image;
        });

        chart.update();
    }, []);

    return <Line ref={chartRef} data={data} options={options} />;
}
