"use client"

import { AnnouncementProps } from "@/app/helpers/types"

import Layout from "../../../components/Layout"
import Matrix from "../../../components/ContentBuilder"

interface Props {
    data: any
    announcements: AnnouncementProps[]
}

export default function NewsArticleTemplate({data, announcements}: Props) {
    const {entry} = data
    
    return (
        <>
            <Layout
                title={entry.title}
                summary={entry.summary}
                showSummary={true}
                outbreak={entry.outbreak}
                announcements={announcements}
            >
                <Matrix blocks={entry.bodyContent} />
            </Layout>
        </>
    )
}
