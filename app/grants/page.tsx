"use client"

import Nav from "../components/Nav"
import Layout from "../components/Layout"
import {useState} from "react"
import {Grid, Col} from "@tremor/react"
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
            <div className="mt-6">
                <Nav selected="explore" />

                <Grid className="gap-y-2 mt-6">
                    <Col>
                        <SearchInput setSearchResponse={setSearchResponse} />
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
