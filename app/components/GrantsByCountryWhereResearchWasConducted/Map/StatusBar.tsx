import { dollarValueFormatter } from '../../../helpers/value-formatters'
import type { FeatureProperties } from './types'

interface Props {
    selectedFeature: FeatureProperties
    setSelectedFeature: (feature: FeatureProperties | null) => void
}

export default function StatusBar({
    selectedFeature,
    setSelectedFeature,
}: Props) {
    return (
        <div className="max-w-full md:max-w-none rounded-lg text-sm border bg-white opacity-100 shadow border-gray-100">
            <div className="border-gray-100 border-b px-4 py-2 flex justify-between items-center">
                <p className="font-medium text-gray-700">
                    {selectedFeature.name}
                </p>

                <button
                    className="text-xs"
                    onClick={() => setSelectedFeature(null)}
                >
                    X
                </button>
            </div>

            <div className="px-4 py-2 space-y-1">
                <div className="flex items-center justify-between space-x-8">
                    <div className="flex items-center space-x-2">
                        <p className="text-left text-gray-700">Grants</p>
                    </div>

                    <div className="flex justify-between items-center gap-x-2">
                        <p className="font-medium tabular-nums text-right whitespace-nowrap text-gray-700">
                            {selectedFeature.totalGrants}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between space-x-8">
                    <div className="flex items-center space-x-2">
                        <p className="text-left text-gray-700">
                            Known Financial Commitments (USD)
                        </p>
                    </div>

                    <div className="flex justify-between items-center gap-x-2">
                        <p className="font-medium tabular-nums text-right whitespace-nowrap text-gray-700">
                            {dollarValueFormatter(
                                selectedFeature.totalAmountCommitted,
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
