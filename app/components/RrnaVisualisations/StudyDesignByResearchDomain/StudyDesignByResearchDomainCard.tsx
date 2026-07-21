'use client'

import { useContext, useMemo } from "react"
import RrnaVisualisationCard from "../RrnaVisualisationCard"
import BarChart from "./BarChart"
import { prepareStudyDesignByDomainChartData } from "./helpers"
import { RrnaFilterContext } from "@/app/helpers/filters"

const StudyDesignByResearchDomainCard = () => {
  const { studies } = useContext(RrnaFilterContext)

  const { chartData, highestValue } = useMemo(() => (
      prepareStudyDesignByDomainChartData(studies)
  ), [studies])

  return (
    <RrnaVisualisationCard
      id="distribution-of-studies-by-domain-and-study-design"
      title="Distribution of studies by domain and study design"
      subtitle="This chart displays the number of studies by research domain and study design."
      footnote="Some studies focus on more than one domain."
    >
      <BarChart
        chartData={chartData}
        highestValue={highestValue}
      />
    </RrnaVisualisationCard>
)}

export default StudyDesignByResearchDomainCard
