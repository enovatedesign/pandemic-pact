import TopTenFundersByTotalAwardedDoughnutChart from './components/charts/TopTenFundersByTotalAwardedDoughnutChart'
import CountryFundingPerYearLineChart from './components/charts/CountryFundingPerYearLineChart'
import Search from './components/search'

export default function Home() {
    return (
        <div className="pt-8 p-4">
            {process.env.MEILISEARCH_HOST &&
                <div className="mb-8">
                    <Search />
                </div>
            }

            <div className="container mx-auto grid grid-cols-2 gap-8">
                <div className="col-span-2">
                    <CountryFundingPerYearLineChart />
                </div>

                <div className="col-span-1">
                    <TopTenFundersByTotalAwardedDoughnutChart />
                </div>
            </div>
        </div>
    )
}
