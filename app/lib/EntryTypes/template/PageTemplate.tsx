"use client"

import {useMemo, useState} from "react"
import Layout from "../../../components/Layout"
import Matrix from "../../../components/ContentBuilder"

export default function PageTemplate({data}) {

    const { entry } = data

    // console.log('Page Template Data: ', entry)

    return (
        <>
            <Layout
                title={entry.title}
                summary={entry.summary}
                sidebarContent={false}
                >
                <div className="container">

                    <Matrix blocks={entry.bodyContent} />
                    
                </div>
            </Layout>
        </>
    )
}