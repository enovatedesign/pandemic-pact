import type { FeatureProperties } from './types'
import InfoModal from '../../InfoModal'
import { dollarValueFormatter } from '../../../helpers/value-formatters'

interface Props {
    selectedFeatureProperties: FeatureProperties
}

export default function JointFeaturesModal({
    selectedFeatureProperties,
}: Props) {
    const properties = Array.isArray(
        selectedFeatureProperties.jointFeatureProperties,
    )
        ? selectedFeatureProperties.jointFeatureProperties
        : []

    return (
        <InfoModal customButtonClasses="align-middle -translate-y-[2px]">
            <div className="flex flex-col gap-y-4">
                {properties.map(
                    ({
                        id,
                        name,
                        totalGrants,
                        totalAmountCommitted,
                        totalJointGrants,
                        totalJointAmountCommitted,
                    }) => (
                        <div key={id}>
                            <p className="text-sm font-semibold !m-0 !mb-2">
                                {name}
                            </p>

                            <div className="flex items-center justify-between space-x-8">
                                <p className="!m-0 text-sm">Grants</p>
                                <p className="!m-0 text-sm">
                                    {totalJointGrants} / {totalGrants}
                                </p>
                            </div>

                            <div className="flex items-center justify-between space-x-8">
                                <p className="!m-0 text-sm">
                                    Known Financial Commitments (USD)
                                </p>

                                <p className="!m-0 text-sm">
                                    {dollarValueFormatter(
                                        totalJointAmountCommitted || 0,
                                    )}{' '}
                                    /{' '}
                                    {dollarValueFormatter(totalAmountCommitted)}
                                </p>
                            </div>
                        </div>
                    ),
                )}
            </div>
        </InfoModal>
    )
}
