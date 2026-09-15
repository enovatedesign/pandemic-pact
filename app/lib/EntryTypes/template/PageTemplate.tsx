"use client"

import Layout from "../../../components/Layout"
import Matrix from "../../../components/ContentBuilder"
import { AnnouncementProps } from "@/app/helpers/types"

interface Props {
    data: any
    announcements: AnnouncementProps[]
}

export default function PageTemplate({ data, announcements }: Props) {
    const { entry } = data

    return (
        <>
            <Layout
                title={entry.title}
                summary={entry.summary}
                showSummary={entry.showSummary}
                outbreak={entry.outbreak}
                announcements={announcements}
            >
                <Matrix blocks={entry.bodyContent} />
            </Layout>
        </>
    )
}
