"use client"

import { useContext, useMemo, useState } from "react"
import { ArrowLeftIcon } from "@heroicons/react/outline"

import { GlobalFilterContext } from "@/app/helpers/filters"
import { prepareHundredDaysClinicalTrialData, prepareHundredDaysClinicalTrialSubCategoryData } from "./helpers"

import VisualisationCard from "@/app/components/VisualisationCard"
import ClinicalTrialResearchAreas from "./ClinicalTrialResearchAreas"
import ClinicalTrialPhases from "./ClinicalTrialPhases"

const ClinicalTrials = () => {
    const [showResearchAreaBreakdown, setShowResearchAreaBreakdown] = useState(false)

    const { grants } = useContext(GlobalFilterContext)

    const { clinicalTrialPhases, clinicalTrialsByResearchArea } = useMemo(() => ({
        clinicalTrialPhases: prepareHundredDaysClinicalTrialData(grants),
        clinicalTrialsByResearchArea: prepareHundredDaysClinicalTrialSubCategoryData(grants)
    }), [grants])
    
    const handleClick = () => {
        setShowResearchAreaBreakdown(!showResearchAreaBreakdown)
    }
    
    return (
        <VisualisationCard
            id="distribution-of-clinical-research-grants-by-clinical-trial-phases"
            title="Distribution of Clinical Research Grants by Clinical Trial Phases"
            footnote="Please note: Grants may fall under more than one research category, and funding amounts are included only when they have been published by the funder."
        >

            <div className="w-full">
                {!showResearchAreaBreakdown ? (
                    <div className="w-full space-y-8 lg:space-y-12">
                        <ClinicalTrialPhases chartData={clinicalTrialPhases}/>
                        
                        <div className="flex justify-end w-full">
                            <button
                                className="self-start text-center font-medium rounded-full no-underline transition-colors duration-200 ease-in-out disabled:bg-disabled disabled:cursor-default disabled:hover:bg-disabled text-sm px-4 py-1 lg:text-base uppercase text-white bg-secondary hover:bg-secondary-lighter ignore-in-image-export"
                                onClick={handleClick}
                            >
                                View Research Areas
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-center items-center w-full">
                            <button onClick={handleClick} className="flex items-center">
                                <span className="cursor-pointer mr-4 bg-brand-grey-200 p-1.5 rounded-md shadow-lg">
                                    <ArrowLeftIcon className="size-6 text-brand-grey-500" />
                                </span>
                            </button>

                            <p className="text-brand-grey-500">Viewing All Research Areas</p>
                        </div>

                        <ClinicalTrialResearchAreas
                            chartData={clinicalTrialsByResearchArea}
                        />
                    </>

                )}
            </div>
        </VisualisationCard>
    )
}

export default ClinicalTrials