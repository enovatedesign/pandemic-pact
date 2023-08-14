"use client"

import {useState} from "react";
import TopTenFundersByTotalAwardedDoughnutChart from './components/charts/TopTenFundersByTotalAwardedDoughnutChart'
import CountryFundingPerYearLineChart from './components/charts/CountryFundingPerYearLineChart'
import Search from './components/Search'
import {type SearchResults} from './types/search-results'

export default function Home() {
    const [searchResults, setSearchResults] = useState<SearchResults>([])

    return (
        <div className="container mx-auto p-8 flex flex-col gap-y-8">
            <Search
                setSearchResults={setSearchResults}
            />

            <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2">
                    <CountryFundingPerYearLineChart />
                </div>

                <div className="col-span-1">
                    <TopTenFundersByTotalAwardedDoughnutChart
                        searchResults={searchResults}
                    />
                </div>
            </div>
        </div>
    )
}
