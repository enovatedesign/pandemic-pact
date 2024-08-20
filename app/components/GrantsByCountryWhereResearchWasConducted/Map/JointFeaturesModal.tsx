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
        <InfoModal marginX={false}>
            <table className="w-full !rounded-t-xl overflow-hidden border-2 border-secondary/30">
                <thead className="bg-gradient-to-t from-primary-darker to-primary">
                    <tr>
                        <th className="text-left pt-3 !pl-4 !leading-loose !font-bold !text-secondary">Name</th>
                        <th className="text-left pt-3 !leading-loose !font-bold !text-secondary">Grants (Joint / Total)</th>
                        <th className="text-left pt-3 !pr-4 !leading-loose !font-bold !text-secondary">Known Financial Commitments (USD)</th>
                    </tr>
                </thead>
                <tbody className="bg-primary !pl-4 border-t-2 border-secondary/30">
                    {properties.map((data, index: number) => {

                            const {
                                name,
                                totalGrants,
                                totalAmountCommitted,
                                totalJointGrants,
                                totalJointAmountCommitted,
                            } = data

                            const trClasses = [
                                'border-b-2 border-secondary/30 '
                            ].filter(Boolean).join(' ')
                            
                            const tdClasses = [
                                'text-secondary',
                            ].filter(Boolean).join(' ')

                            return (
                                <tr key={index} className={trClasses}>
                                    <td className={`${tdClasses} !pl-4 border-r-2 border-secondary/30`}>
                                        {name}
                                    </td>

                                    <td className={`${tdClasses} border-r-2 border-secondary/30`}>
                                        {totalJointGrants} / {totalGrants}
                                    </td>
                                    
                                    <td className={`${tdClasses}`}>
                                        {dollarValueFormatter(totalJointAmountCommitted || 0)} / {dollarValueFormatter(totalAmountCommitted)}
                                    </td>
                                </tr>
                            )
                        }
                    )}
                </tbody>
            </table>
        </InfoModal>
    )
}
