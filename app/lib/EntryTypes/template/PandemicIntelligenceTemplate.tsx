"use client"

import { AnnouncementProps, PolicyRoadmapEntryTypeHandle } from '@/app/helpers/types'
import { defaultProseClasses } from '@/app/helpers/prose-classes'
import Matrix from '../../../components/ContentBuilder'
import PandemicIntelligenceVisualisePageClient from '@/app/visualise/policy-roadmaps/pandemic-intelligence/PandemicIntelligenceVisualisePageClient'
import InfoModal from '@/app/components/InfoModal'

interface Props {
    data: {
        entry: {
            title: string,
            richTextSummary: string
            showSummary: boolean
            modalLinkText?: string
            modalText?: string
            bodyContent: any[]
            typeHandle: PolicyRoadmapEntryTypeHandle
        },
    }
    announcement: AnnouncementProps
}

export default function PandemicIntelligenceTemplate ({ data, announcement }: Props) {
    const { entry } = data

    const { richTextSummary, modalLinkText, modalText } = entry

    const summaryClasses = 'relative z-10 max-w-none mt-2 space-y-2 lg:text-xl prose-p:text-white/70 prose-a:text-white'
    
    const summary = (
        <div className={defaultProseClasses({
            marginX: false,
            customClasses: summaryClasses
        })}>
            <div dangerouslySetInnerHTML={{ __html: richTextSummary }} />
            {modalLinkText && modalText && (
                <div className='flex items-center gap-x-1'>
                    <p>{modalLinkText}</p>
                    <InfoModal iconColour="text-white" customButtonClasses="mb-2 inline-flex">
                        <div 
                            className="prose-p:text-secondary" 
                            dangerouslySetInnerHTML={{ __html: modalText }}
                        />
                    </InfoModal>
                </div>
            )}
        </div>
    )

    return (
        <PandemicIntelligenceVisualisePageClient
            title={entry.title}
            announcement={announcement}
            summary={summary}
            showSummary={entry.showSummary}
            typeHandle={entry.typeHandle}
        >
            <Matrix blocks={entry.bodyContent} />
        </PandemicIntelligenceVisualisePageClient>
    ) 
}