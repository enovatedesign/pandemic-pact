import {useState} from "react"
import {TabPanel, Grid, Col} from "@tremor/react"
import SearchInput from "./SearchInput"
import ResultsTable from "./ResultsTable"
import {type SearchResults} from './types/search-results'

export default function ExploreTabPanel() {
    const [searchResults, setSearchResults] = useState<SearchResults>([])

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
