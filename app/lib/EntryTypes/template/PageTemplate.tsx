"use client"

import {useMemo, useState} from "react"
import Layout from "../../../components/Layout"
import Matrix from "../../../components/ContentBuilder"

export default function PageTemplate({data}: any) {

    const { entry } = data

    // console.log('Page Template Data: ', entry)

    return (
        <>
            <Layout
                title={entry.title}
                summary={entry.summary}
                showSummary={entry.showSummary}
                sidebarContent={false}
                >
                <Matrix blocks={entry.bodyContent} />
                    
            </Layout>
        </>
    )
}