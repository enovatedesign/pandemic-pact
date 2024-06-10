"use client"

import Layout from "../../../components/Layout"
import Matrix from "../../../components/ContentBuilder"

export default function PageTemplate({data}: any) {
    const {entry} = data

    return (
        <>
            <Layout
                title={entry.title}
                summary={entry.summary}
                showSummary={entry.showSummary}
                outbreak={entry.outbreak}
            >
                <Matrix blocks={entry.bodyContent} />
            </Layout>
        </>
    )
}
