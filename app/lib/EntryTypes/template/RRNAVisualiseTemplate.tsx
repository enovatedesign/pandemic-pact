"use client"
import Image from "next/image"

import Matrix from "../../../components/ContentBuilder"
import { AnnouncementProps } from "@/app/helpers/types"
import RrnaVisualisePageClient from "@/app/rrna/RrnaVisualisePageClient"
import { defaultProseClasses } from "@/app/helpers/prose-classes"

interface Props {
    data: any
    announcement: AnnouncementProps
}

export default function RRNAVisualiseTemplate({data, announcement}: Props) {
    const { entry } = data
    const { title, bodyContent, bottomAccordion } = entry
    const summary = (
        <div className="relative mt-2 text-white opacity-50 lg:text-xl z-10">
            <div
                className={defaultProseClasses({ customClasses: '!text-white max-w-none prose-a:text-white' })}
                dangerouslySetInnerHTML={{ __html: entry.rrnaSummary }}
            />
        </div>
    )
    
    return (
        <>
            <RrnaVisualisePageClient
                title={title}
                summary={summary}
                announcement={announcement}
                bottomAccordion={bottomAccordion}
            >
                <Matrix blocks={bodyContent} />
            </RrnaVisualisePageClient>
        </>
    )
}