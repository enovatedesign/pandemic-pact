import { useState } from 'react'
import { ChartBarIcon, ClockIcon } from '@heroicons/react/solid'
import VisualisationCard from '../VisualisationCard'
import Switch from '../Switch'
import BarChart from './BarChart'
import TemporalChart from './TemporalChart'

export default function GrantsByDisease() {
    const [hideCovid, setHideCovid] = useState(false)
    const [numOfGrantsBoolean, setNumOfGrantsBoolean] = useState(false)

    const tabs = [
        {
            tab: {
                icon: ClockIcon,
                label: 'Temporal',
            },
            content: (
                <TemporalChart
                    hideCovid={hideCovid}
                    numOfGrantsBoolean={numOfGrantsBoolean}
                />
            ),
        },
        {
            tab: {
                icon: ChartBarIcon,
                label: 'Bars',
            },
            content: (
                <BarChart
                    hideCovid={hideCovid}
                    numOfGrantsBoolean={numOfGrantsBoolean}
                />
            ),
        },
    ]

    const infoModalContents = (
        <>
            <h3>
                Global annual funding for research on diseases with a pandemic
                potential.
            </h3>

            <p className="text-brand-grey-500">
                The list contains the WHO priority diseases plus pandemic
                influenza, Mpox and plague
            </p>

            <p className="text-brand-grey-500">
                The chart shows the total number of grants awarded and amount of
                funding committed for each disease per calendar year.
            </p>

            <p className="text-brand-grey-500">
                The pop up box notes the year on year percentage increase or
                decrease for each priority disease.
            </p>
        </>
    )

    const handleShownDataset = () => {
        setNumOfGrantsBoolean(!numOfGrantsBoolean)
    }

    return (
        <VisualisationCard
            id="grants-by-disease"
            title="Global annual funding for research on diseases with a pandemic potential"
            subtitle="Total number of grants and US dollars committed for each disease"
            footnote="Please note: Grants may fall under more than one disease. Funding amounts are included only when they have been published by the funder and are included within the year of the grant award start date."
            infoModalContents={infoModalContents}
            tabs={tabs}
        >
            <div className="w-full flex flex-col gap-y-2 lg:gap-y-0 lg:flex-row lg:justify-between :items-center">
                <Switch
                    checked={hideCovid}
                    onChange={setHideCovid}
                    label="Hide COVID-19"
                    theme="light"
                    className="ignore-in-image-export"
                />

                <Switch
                    checked={numOfGrantsBoolean}
                    onChange={handleShownDataset}
                    label="Number of grants"
                    theme="light"
                    className="ignore-in-image-export"
                />

                <Switch
                    checked={!numOfGrantsBoolean}
                    onChange={handleShownDataset}
                    label="Known financial commitments (USD)"
                    theme="light"
                    className="ignore-in-image-export"
                />
            </div>
        </VisualisationCard>
    )
}
