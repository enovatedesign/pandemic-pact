import TopTenFundersByTotalAwardedDoughnutChart from './components/charts/TopTenFundersByTotalAwardedDoughnutChart'

export default function Home() {
    return (
        <div className="pt-8 p-4">
            <div className="container mx-auto grid grid-cols-2 gap-4">
                <div className="col-span-1">
                    <TopTenFundersByTotalAwardedDoughnutChart />
                </div>

                <div className="col-span-1">
                </div>
            </div>
        </div>
    )
}
