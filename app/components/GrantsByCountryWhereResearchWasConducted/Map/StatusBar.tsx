import { dollarValueFormatter } from '../../../helpers/value-formatters'
import Button from '../../../components/Button'
import Switch from '../../../components/Switch'
import type { FeatureProperties } from './types'
import JointFeaturesModal from './JointFeaturesModal'

interface Props {
    selectedFeatureProperties: FeatureProperties
    setSelectedFeatureId: (featureId: string | null) => void
    highlightJointFundedCountries: boolean
    setHighlightJointFundedCountries: (value: boolean) => void
    grantField: string
}

export default function StatusBar({
    selectedFeatureProperties,
    setSelectedFeatureId,
    highlightJointFundedCountries,
    setHighlightJointFundedCountries,
    grantField,
}: Props) {
    const viewButtonQueryFilters = {
        [grantField]: [selectedFeatureProperties.id],
    }

    const viewButtonHref =
        '/grants?filters=' + JSON.stringify(viewButtonQueryFilters)

    let totalGrants: string

    if (
        highlightJointFundedCountries &&
        typeof selectedFeatureProperties.totalJointGrants === 'number'
    ) {
        totalGrants = `${selectedFeatureProperties.totalJointGrants} / ${selectedFeatureProperties.totalGrants}`
    } else {
        totalGrants = `${selectedFeatureProperties.totalGrants}`
    }

    let totalAmountCommitted: string

    if (
        highlightJointFundedCountries &&
        typeof selectedFeatureProperties.totalJointAmountCommitted === 'number'
    ) {
        totalAmountCommitted = `${dollarValueFormatter(
            selectedFeatureProperties.totalJointAmountCommitted,
        )} / ${dollarValueFormatter(
            selectedFeatureProperties.totalAmountCommitted,
        )}`
    } else {
        totalAmountCommitted = dollarValueFormatter(
            selectedFeatureProperties.totalAmountCommitted,
        )
    }

    const shouldShowJointFeaturesModal =
        highlightJointFundedCountries &&
        typeof selectedFeatureProperties.jointFeatureProperties === 'object' &&
        selectedFeatureProperties.jointFeatureProperties.length > 0

    return (
        <div className="max-w-full md:max-w-none rounded-lg text-sm border bg-white opacity-100 shadow border-gray-100">
            <div className="border-gray-100 border-b px-4 py-2 flex justify-between items-center">
                <p className="font-medium text-gray-700">
                    {selectedFeatureProperties.name}
                </p>

                <button
                    className="text-xs"
                    onClick={() => {
                        setSelectedFeatureId(null)
                        setHighlightJointFundedCountries(false)
                    }}
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
                            {totalGrants}
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
                            {totalAmountCommitted}
                        </p>
                    </div>
                </div>
            </div>

            <div className="py-2 px-2 flex justify-between items-center">
                <div className="flex items-center gap-x-4">
                    <Switch
                        checked={highlightJointFundedCountries}
                        onChange={setHighlightJointFundedCountries}
                        label="Show Joint-funded Countries"
                        theme="light"
                    />

                    {shouldShowJointFeaturesModal && (
                        <JointFeaturesModal
                            selectedFeatureProperties={
                                selectedFeatureProperties
                            }
                        />
                    )}
                </div>

                <Button size="xsmall" href={viewButtonHref}>
                    View Grants
                </Button>
            </div>
        </div>
    )
}
