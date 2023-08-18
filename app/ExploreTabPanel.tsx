import {useState} from "react"
import {TabPanel, Grid, Col, Card} from "@tremor/react"
import SearchInput from "./SearchInput"
import ResultsTable from "./ResultsTable"

export default function ExploreTabPanel() {
    const [searchResults, setSearchResults] = useState([])

    return (
        <TabPanel key="explore-tab-panel">
            <div className="mt-6">
                <Grid className="gap-y-3">
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
        </TabPanel>
    )
}
