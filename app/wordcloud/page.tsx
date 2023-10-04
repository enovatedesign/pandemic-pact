"use client"

import {Grid, Col} from "@tremor/react"
import Nav from "../components/Nav"
import Layout from "../components/Layout"

import WordCloud from "../components/WordCloud"

export default function Visualise() {
    return (
        <Layout
            title="Pandemic PACT Tracker"
            summary="Lorem ipsum dolor sit amet, consetetur sadipscing elitr."
            sidebarContent={<></>}
        >
            <div className="mt-6 font-sans">
                <Nav selected="wordcloud" />

                <Grid
                    numItems={12}
                    className="mt-6 gap-4"
                >
                    <Col numColSpan={12}>
                        <WordCloud filterKey="Disease" randomSeedString="2324234234" /> 
                        <WordCloud filterKey="Pathogen" randomSeedString="2324234234" /> 
                    </Col>
                </Grid>
            </div>
        </Layout>
    )
}

