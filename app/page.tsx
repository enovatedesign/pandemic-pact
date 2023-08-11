"use client"

import {useState} from "react";
import TopTenFundersByTotalAwardedDoughnutChart from './components/charts/TopTenFundersByTotalAwardedDoughnutChart'
import CountryFundingPerYearLineChart from './components/charts/CountryFundingPerYearLineChart'
import Search from './components/Search'
import {type SearchResults} from './types/search-results'

export default function Home() {
    const [searchResults, setSearchResults] = useState<SearchResults>([])

    return (
        <div className="pt-8 p-4">
            <div className="mb-8">
                <Search
                    setSearchResults={setSearchResults}
                />
            </div>

            <div className="container mx-auto grid grid-cols-2 gap-8">
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
