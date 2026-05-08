import { Fragment } from "react"

import BarList from "@/app/components/BarList/BarList"
import BarListRow from "@/app/components/BarList/BarListRow"
import BarListRowHeading from "@/app/components/BarList/BarListRowHeading"
import { BarListDatum, getColoursByField } from "@/app/helpers/bar-list"

const ClinicalTrialResearchAreas = ({ chartData }: { chartData: Record<string, BarListDatum[]> }) => {
    const { brightColours, dimColours } = getColoursByField('hundredDaysMissionClinicalTrial')
    
    return (
        <div className="w-full space-y-12">
            {Object.entries(chartData).map(([researchArea, clinicalTrials]) => (
                <div key={researchArea}>
                    <h3 className="text-lg mb-2 mt-6 col-span-4">
                        {researchArea}
                    </h3>

                    <BarList
                        data={clinicalTrials}
                        brightColours={brightColours}
                        dimColours={dimColours}
                    >
                        {clinicalTrials.map((datum: any, index: number) => (
                            <Fragment key={datum["Category Value"]}>
                                <BarListRowHeading>
                                    <p className="bar-chart-category-label text-gray-600 text-sm">
                                        {datum["Category Label"]}
                                    </p>
                                </BarListRowHeading>

                                <BarListRow dataIndex={index} />
                            </Fragment>
                        ))}
                    </BarList>
                </div>
            ))}
        </div>
    )
}

export default ClinicalTrialResearchAreas
