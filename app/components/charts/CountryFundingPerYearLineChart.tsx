"use client"

import {Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Legend, Title, Tooltip, TooltipItem} from 'chart.js';
import type {StaticImageData} from "next/image"
import {Line} from "react-chartjs-2";
import {millify} from "millify";

import gbFlagSvg from "../../../public/country-flags/gb.svg";
import usFlagSvg from "../../../public/country-flags/us.svg";
import deFlagSvg from "../../../public/country-flags/de.svg";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Legend, Title, Tooltip);

const createImageFromSVG = (svg: StaticImageData) => {
    const aspectRatio = svg.width / svg.height;
    const width = 15;
    const height = width / aspectRatio;

    const image = new Image(width, height);
    image.src = svg.src;
    return image;
}

const gbFlag = createImageFromSVG(gbFlagSvg);
const usFlag = createImageFromSVG(usFlagSvg);
const deFlag = createImageFromSVG(deFlagSvg);

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
            pointStyle: usFlag,
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
            pointStyle: gbFlag,
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
            pointStyle: deFlag,
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

export default function CountryFundingPerYearLineChart() {
    return <Line data={data} options={options} />;
}
