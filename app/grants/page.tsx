"use client"

import {Suspense, useState} from "react"
import {Grid, Col} from "@tremor/react"
import Nav from "../components/Nav"
import Layout from "../components/Layout"
import SearchInput from "../components/SearchInput"
import ResultsTable from "../components/ResultsTable"
import {type SearchResponse} from '../types/search'

export default function Explore() {
    const [searchResponse, setSearchResponse] = useState<SearchResponse>({
        hits: [],
        query: "",
        estimatedTotalHits: 0,
    })

    return (
        <Layout
            title="Pandemic PACT Tracker"
            summary="Lorem ipsum dolor sit amet, consetetur sadipscing elitr."
        >
            <div className="container mx-auto my-6 lg:my-12">
                <Nav selected="explore" />

                <Grid className="gap-y-2 mt-6">
                    <Col>
                        {/*
                        Note that the `Suspense` here is to suppress the following error:
                        https://nextjs.org/docs/messages/deopted-into-client-rendering
                        TODO work out what to do with the `Suspense` `fallback`
                        */}
                        <Suspense fallback={<div>Loading...</div>}>
                            <SearchInput setSearchResponse={setSearchResponse} />
                        </Suspense>
                    </Col>

                    {searchResponse.hits.length > 0 &&
                        <Col>
                            <ResultsTable searchResponse={searchResponse} />
                        </Col>
                    }
                </Grid>
            </div>
        </Layout>
    )
}
