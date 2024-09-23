"use client"

import Layout from "../../../components/Layout"
import Matrix from "../../../components/ContentBuilder"
import { AnnouncementProps } from "@/app/helpers/types"

interface Props {
    data: any
    announcement: AnnouncementProps
}

export default function PageTemplate({data, announcement}: Props) {
    const {entry} = data

    return (
        <>
            <Layout
                title={entry.title}
                summary={entry.summary}
                showSummary={entry.showSummary}
                outbreak={entry.outbreak}
                announcement={announcement}
            >
                <Matrix blocks={entry.bodyContent} />
            </Layout>
        </>
    )
}
