"use client"

import { AnnouncementProps, PolicyRoadmapEntryTypeHandle } from '@/app/helpers/types'
import { defaultProseClasses } from '@/app/helpers/prose-classes'
import Matrix from '../../../components/ContentBuilder'
import HundredDaysMissionVisualisePageClient from '@/app/visualise/policy-roadmaps/100-days-mission/HundredDaysMissionVisualisePageClient'

interface Props {
    data: {
        entry: {
            title: string,
            richTextSummary: string
            showSummary: boolean
            bodyContent: any[]
            typeHandle: PolicyRoadmapEntryTypeHandle
        },
    }
    announcement: AnnouncementProps
}

export default function  HundredDaysMissionTemplate ({ data, announcement }: Props) {
    const { entry } = data
    
    const summary = (
        <div 
            className={defaultProseClasses({ 
                marginX: false, 
                customClasses: 'relative z-10 max-w-none mt-2 space-y-2 lg:text-xl prose-p:text-white/70 prose-a:text-white' 
            })}
            dangerouslySetInnerHTML={{ __html: entry.richTextSummary }}
        >
        </div>
    )

    return (
        <HundredDaysMissionVisualisePageClient 
            title={entry.title}
            announcement={announcement}
            summary={summary}
            showSummary={entry.showSummary} 
            typeHandle={entry.typeHandle}
        >
            <Matrix blocks={entry.bodyContent} />
        </HundredDaysMissionVisualisePageClient>
    ) 
}