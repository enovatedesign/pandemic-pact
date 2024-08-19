"use client"

import VisualisePageClient from "../../../visualise/VisualisePageClient"
import selectOptions from "../../../../data/dist/select-options.json"
import Matrix from "../../../components/ContentBuilder"

export default function OutbreakTemplate({data}: any) {
    const {entry} = data

    const diseaseLabel = entry.outbreakDisease

    const fixedDiseaseOptions = selectOptions['Disease']
        .filter(disease => disease.label === diseaseLabel)
        .map(data => ({...data, isFixed: true}))

    return (
        <VisualisePageClient 
            outbreak={true}
            diseaseLabel={diseaseLabel}
            title={`OUTBREAK: ${entry.title}`}
            summary={entry.summary}
            showSummary={entry.showSummary}
            fixedDiseaseOptions={fixedDiseaseOptions}
        >
            {entry.bodyContent && entry.bodyContent.length > 0 && (
                <Matrix blocks={entry.bodyContent} />
            )}
        </VisualisePageClient>
    )
}
