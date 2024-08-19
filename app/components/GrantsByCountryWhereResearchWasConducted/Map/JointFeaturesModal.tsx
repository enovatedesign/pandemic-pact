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
        <InfoModal>
            <table>
                <thead className='border-b border-brand-grey-200'>
                    <tr>
                        <th className="text-left font-bold">Name</th>
                        <th className="text-left font-bold">Grants (Joint / Total)</th>
                        <th className="text-left font-bold">Known Financial Commitments (USD)</th>
                    </tr>
                </thead>
                <tbody>
                    {properties.map(
                        ({
                            id,
                            name,
                            totalGrants,
                            totalAmountCommitted,
                            totalJointGrants,
                            totalJointAmountCommitted,
                        }) => (
                            <tr key={id} className="border-b border-brand-grey-200 py-2 px-4">
                                <td className="text-secondary">
                                    {name}
                                </td>

                                <td className="text-secondary">
                                    {totalJointGrants} / {totalGrants}
                                </td>
                                
                                <td className="text-secondary">
                                    {dollarValueFormatter(totalJointAmountCommitted || 0)} / {dollarValueFormatter(totalAmountCommitted)}
                                </td>
                            </tr>
                        )
                    )}
                </tbody>
            </table>

        </InfoModal>
    )
}
