export default function StatisticsBlock({ block }) {
	const statistics = block.statistics;

	if (statistics) {
		return (
			<div className="flex flex-col gap-6 md:flex-row md:gap-12 block-statistics">
				{statistics.map((statistic) => (
					<article
						className="flex flex-col gap-2 text-center md:py-6 md:w-1/3 lg:gap-4 statistic"
						key={statistic.id}
					>
						<h2 className="font-bold text-4xl md:text-6xl lg:text-7xl">
							{statistic.statisticYears}
						</h2>

						<p className="font-medium text-gray-540 uppercase md:text-lg">
							{statistic.statisticContent}
						</p>
					</article>
				))}
			</div>
		);
	} else {
		return null;
	}
}
