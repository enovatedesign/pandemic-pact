"use client"

import { AnnouncementProps } from "@/app/helpers/types"

import Layout from "../../../components/Layout"
import Matrix from "../../../components/ContentBuilder"

interface Props {
    data: any
    announcement: AnnouncementProps
}

export default function NewsArticleTemplate({data, announcement}: Props) {
    const {entry} = data
    
    return (
        <>
            <Layout
                title={entry.title}
                summary={entry.summary}
                showSummary={true}
                outbreak={entry.outbreak}
                announcement={announcement}
            >
                <Matrix blocks={entry.bodyContent} />
            </Layout>
        </>
    )
}
