import TopTenFundersByTotalAwardedDoughnutChart from './components/charts/TopTenFundersByTotalAwardedDoughnutChart'

export default function Home() {
    return (
        <div className="p-16">
            <div className="container mx-auto grid grid-cols-2">
                <div className="col-span-1 flex flex-col gap-y-4">
                    <h1 className="text-2xl font-bold text-center">
                        Top Ten Funders by Total Awarded
                    </h1>

                    <TopTenFundersByTotalAwardedDoughnutChart />
                </div>

                <div className="col-span-1">
                </div>
            </div>
        </div>
    )
}
