"use client"

import {Suspense, useState} from "react"
import Layout from "../components/Layout"
import SearchInput from "../components/SearchInput"
import ResultsTable from "../components/ResultsTable"
import {SearchResponse} from '../helpers/search'

export default function ExplorePageClient() {
    const [searchResponse, setSearchResponse] = useState<SearchResponse>({
        hits: [],
        query: "",
    })

    return (
        <Layout
            title="Grant Search"
            showSummary={true}
            summary="Find, filter and explore grant abstracts, linked publications and other curated data on research grants for infectious disease with a pandemic potential."
        >
            <div className="container mx-auto my-6 lg:my-12">
                <div className="flex flex-col space-y-6 lg:space-y-8 mt-6">
                    <div>
                        {/*
                        Note that the `Suspense` here is to suppress the following error:
                        https://nextjs.org/docs/messages/deopted-into-client-rendering
                        TODO work out what to do with the `Suspense` `fallback`
                        */}
                        <Suspense fallback={<div>Loading...</div>}>
                            <SearchInput setSearchResponse={setSearchResponse} />
                        </Suspense>
                    </div>

                    {searchResponse.hits.length > 0 &&
                        <div>
                            <ResultsTable searchResponse={searchResponse} />
                        </div>
                    }
                </div>
            </div>
        </Layout>
    )
}
