import { useState, useContext } from 'react'
import {
    Radar,
    RadarChart,
    PolarGrid,
    Tooltip,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from 'recharts'
import { rechartTooltipContentFunction } from './RechartTooltipContent'
import VisualisationCard from './VisualisationCard'
import RadiusAxisLabel from './RadiusAxisLabel'
import MultiSelect from './MultiSelect'
import ImageExportLegend from './ImageExportLegend'
import researchLocationRegionOptions from '../../public/data/select-options/ResearchLocationRegion.json'
import researchCatOptions from '../../public/data/select-options/ResearchCat.json'
import { filterGrants, GlobalFilterContext } from '../helpers/filters'
import {
    researchCategoryColours,
    allResearchCategoriesColour,
} from '../helpers/colours'
import { rechartBaseTooltipProps } from '../helpers/tooltip'

export default function GrantsPerMpoxResearchPriority() {
    return (
        <VisualisationCard
            id="grants-by-mpox-research-priority"
            title="Grants by Mpox Research Priority"
        >
        </VisualisationCard>
    )
}
