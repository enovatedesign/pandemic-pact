"use client"

import Nav from "../components/Nav"
import ExploreTabPanel from "../components/ExploreTabPanel"
import Layout from "../components/Layout"
import {type Filters} from "../types/filters"

const Explore = () => {

    return (
        <Layout
            title="Pandemic PACT Tracker"
            summary="Lorem ipsum dolor sit amet, consetetur sadipscing elitr."
        >
            <div className="mt-6">
                <Nav selected="explore" />

                <ExploreTabPanel />
            </div>
        </Layout>
    )
}

export default Explore
