'use client'

import { useContext, useMemo, useState } from "react"
import { RrnaFilterContext } from "@/app/helpers/filters"
import { prepareStudiesByDomainAndStudyPopulationChartData } from "./helpers"
import RrnaVisualisationCard from "../RrnaVisualisationCard"
import BarChart from './BarChart'
import Switch from "@/app/components/Switch"

const StudiesByDomainAndStudyPopulationCard = () => {
    const { studies } = useContext(RrnaFilterContext)
    const [includePregnantWomen, setIncludePregnantWomen] = useState(true)

      const { chartData, highestValue } = useMemo(() => (
          prepareStudiesByDomainAndStudyPopulationChartData(studies, includePregnantWomen)
      ), [studies, includePregnantWomen])

    return (
        <RrnaVisualisationCard
            id="distribution-of-studies-by-domains-study-design-and-study-populations"
            title="Distribution of studies by domain and study population"
            subtitle="This chart displays the number of studies by research domain and study population."
            footnote="Some studies focus on more than one domain or population."
        >
            <Switch
                checked={includePregnantWomen}
                onChange={setIncludePregnantWomen}
                label="Show studies involving pregnant women"
                theme="light"
                className="ignore-in-image-export"
            />
            <BarChart
                chartData={chartData}
                highestValue={highestValue}
            />
        </RrnaVisualisationCard>
    )
}

export default StudiesByDomainAndStudyPopulationCard
