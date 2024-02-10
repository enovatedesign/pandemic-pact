"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { searchRequest } from "../../helpers/search"
import Layout from "../../components/Layout"
import Masthead from "./Masthead"
import BackToGrantSearchLink from "./BackToGrantSearchLink"
import AbstractAndLaySummary from "./AbstractAndLaySummary"
import KeyFacts from "./KeyFacts"
import Publications from "./Publications"
import "/app/css/components/results-table.css"

interface SearchableFieldResults {
    GrantTitleEng: string
    Abstract: string
    LaySummary: string | null
}

interface Props {
    grant: any
}

export default function StaticPage({ grant }: Props) {
    const searchParams = useSearchParams()

    const [searchableFieldResults, setSearchableFieldResults] =
        useState<SearchableFieldResults>({
            GrantTitleEng: grant.GrantTitleEng,
            Abstract: grant.Abstract,
            LaySummary: grant.LaySummary,
        })

    useEffect(() => {
        const searchQueryFromUrl = searchParams.get("q") ?? ""

        if (!searchQueryFromUrl) {
            return
        }

        searchRequest("show", {
            q: searchQueryFromUrl,
            filters: {
                logicalAnd: false,
                filters: [
                    {
                        field: "GrantID",
                        values: [grant.GrantID],
                        logicalAnd: false,
                    },
                ],
            },
        })
            .then((data) => {
                const hit = data.hits[0]

                setSearchableFieldResults({
                    GrantTitleEng:
                        hit.highlight.GrantTitleEng ?? grant.GrantTitleEng,
                    Abstract: hit.highlight.Abstract ?? grant.Abstract,
                    LaySummary: hit.highlight.LaySummary ?? grant.LaySummary,
                })
            })
            .catch((error) => {
                console.error("Error:", error)
            })
    }, [searchParams, grant, setSearchableFieldResults])

    return (
        <Layout
            title={searchableFieldResults.GrantTitleEng}
            mastheadContent={<Masthead grant={grant} />}
        >
            <div className="container mx-auto my-12 relative">
                <BackToGrantSearchLink />

                <AbstractAndLaySummary
                    abstract={searchableFieldResults.Abstract}
                    laySummary={searchableFieldResults.LaySummary}
                />

                <div className="gap-6">
                    <div className="flex flex-col gap-6 bg-white p-6 lg:p-12 rounded-2xl border-2 border-gray-200">
                        <KeyFacts grant={grant} />

                        <Publications grant={grant} />
                    </div>
                </div>
            </div>
        </Layout>
    )
}
