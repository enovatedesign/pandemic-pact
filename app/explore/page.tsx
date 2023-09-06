"use client"

import Nav from "../components/Nav"
import Layout from "../components/Layout"
import {useState} from "react"
import {Grid, Col} from "@tremor/react"
import SearchInput from "../components/SearchInput"
import ResultsTable from "../components/ResultsTable"
import {type SearchResults} from '../types/search-results'

export default function Explore() {
    const [searchResults, setSearchResults] = useState<SearchResults>([])

    return (
        <Layout
            title="Pandemic PACT Tracker"
            summary="Lorem ipsum dolor sit amet, consetetur sadipscing elitr."
        >
            <div className="mt-6">
                <Nav selected="explore" />

                <Grid className="gap-y-2 mt-6">
                    <Col>
                        <SearchInput setSearchResults={setSearchResults} />
                    </Col>

                    {searchResults.length > 0 &&
                        <Col>
                            <ResultsTable searchResults={searchResults} />
                        </Col>
                    }
                </Grid>
            </div>
        </Layout>
    )
}
