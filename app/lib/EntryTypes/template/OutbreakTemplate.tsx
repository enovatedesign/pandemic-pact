'use client'

import VisualisePageClient from '../../../visualise/VisualisePageClient'
import selectOptions from '../../../../data/dist/select-options.json'
import Matrix from '../../../components/ContentBuilder'
import { FixedDiseaseOptionContext } from '@/app/helpers/filters'

interface FixedDiseaseProps {
    label: string
    value: string
}

export default function OutbreakTemplate({ data }: any) {
    const { entry } = data

    const diseaseLabel = entry.outbreakDisease

    const fixedDiseaseOption = selectOptions['Disease'].find(
        disease => disease.label === diseaseLabel,
    ) as FixedDiseaseProps

    return (
        <FixedDiseaseOptionContext.Provider value={{...fixedDiseaseOption}}>
            <VisualisePageClient
                outbreak={true}
                diseaseLabel={diseaseLabel}
                title={`OUTBREAK: ${entry.title}`}
                summary={entry.summary}
                showSummary={entry.showSummary}
            >
                {entry.bodyContent && entry.bodyContent.length > 0 && (
                    <Matrix blocks={entry.bodyContent} />
                )}
            </VisualisePageClient>
        </FixedDiseaseOptionContext.Provider>
    )
}
