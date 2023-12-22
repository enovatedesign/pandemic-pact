import {useState, useContext} from "react"
import {Radar, RadarChart, PolarGrid, Tooltip, PolarAngleAxis, ResponsiveContainer} from 'recharts';
import VisualisationCard from "./VisualisationCard"
import MultiSelect from "./MultiSelect"
import selectOptions from '../../data/dist/select-options.json'
import dataset from '../../data/dist/grants.json'
import {filterGrants} from "../helpers/filter"
import {GlobalFilterContext} from "../helpers/filter";
import {researchCategoryColours} from "../helpers/colours";

export default function GrantsPerResearchCategoryByRegion() {
    const {grants: globalGrants, filters: selectedFilters} = useContext(GlobalFilterContext)

    const [selectedResearchCategories, setSelectedResearchCategories] = useState<string[]>(['1', '2', '7'])

    const filteredDataset = filterGrants(
        dataset,
        {...selectedFilters, ResearchCat: selectedResearchCategories},
    )

    const researchCategoryOptions = selectedResearchCategories.length === 0 ?
        selectOptions.ResearchCat :
        selectOptions.ResearchCat.filter(
            researchCategoryOption => selectedResearchCategories.includes(researchCategoryOption.value)
        )

    const regionOptions = selectOptions.ResearchLocationRegion.filter(
        regionOption => !["Unspecified"].includes(regionOption.label)
    )

    const chartData = regionOptions.map(function (regionOption) {
        const grantsInRegion = filteredDataset
            .filter((grant: any) => grant.ResearchLocationRegion.includes(regionOption.value))

        const totalGrantsPerResearchCategory = Object.fromEntries(
            researchCategoryOptions.map(({label, value}: any) => ([
                label,
                grantsInRegion.filter((grant: any) => grant.ResearchCat.includes(value)).length,
            ]))
        )

        return {
            "Region": regionOption.label,
            ...totalGrantsPerResearchCategory,
        }
    })

    return (
        <VisualisationCard
            grants={filteredDataset}
            id="grant-per-research-category-by-region"
            title="Regional Distribution of Funding for Research Category"
            subtitle="Each research category is shown in a different colour"
            footnote="Please note: Grants may fall under more than one research category, and funding amounts are included only when they have been published by the funder."
        >
            <div className="flex flex-col w-full">
                <div className="flex items-center justify-between ignore-in-image-export">
                    <MultiSelect
                        options={selectOptions.ResearchCat}
                        selectedOptions={selectedResearchCategories}
                        setSelectedOptions={setSelectedResearchCategories}
                        placeholder="All Research Categories"
                        className="max-w-xs ignore-in-image-export"
                    />

                    {filteredDataset.length < globalGrants.length &&
                        <p>Filtered Grants: {filteredDataset.length}</p>
                    }
                </div>

                <div className="w-full h-[800px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                            <PolarGrid />

                            <PolarAngleAxis
                                dataKey="Region"
                            />

                            {researchCategoryOptions.map(({value, label}) => (
                                <Radar
                                    key={`${label} Radar`}
                                    name={label}
                                    dataKey={label}
                                    stroke={researchCategoryColours[value]}
                                    strokeWidth={2.5}
                                    fillOpacity={0}
                                />
                            ))}

                            <Tooltip
                                isAnimationActive={false}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </VisualisationCard>
    )
}
