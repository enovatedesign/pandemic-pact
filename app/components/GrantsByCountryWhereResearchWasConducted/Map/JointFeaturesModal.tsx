import type { FeatureProperties } from './types'
import InfoModal from '../../InfoModal'
import { dollarValueFormatter } from '../../../helpers/value-formatters'
import { XIcon } from '@heroicons/react/solid'

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
        <InfoModal 
            marginX={false} 
            customCloseButton={
                <XIcon className="text-brand-grey-700 size-5 hover:scale-[1.2] transition duration-150 absolute top-1 right-1 cursor-pointer" aria-hidden="true"/>
            }
            removeSpaceY
        >
            <table className="w-full rounded overflow-hidden">
                <thead className="bg-secondary border-b-2 border-white">
                    <tr>
                        <th className="text-left pt-3 !pl-4 !leading-loose !font-bold !text-white border-r-2 border-white whitespace-nowrap">Name</th>
                        <th className="text-left pt-3 !leading-loose !font-bold !text-white border-r-2 border-white whitespace-nowrap">Grants (Joint / Total)</th>
                        <th className="text-left pt-3 !pr-4 !leading-loose !font-bold !text-white whitespace-nowrap">Known Financial Commitments (Joint / Total)</th>
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
                                index !== properties.length -1 && 'border-b-2 border-secondary/30 '
                            ].filter(Boolean).join(' ')
                            
                            const tdClasses = [
                                'text-secondary whitespace-nowrap',
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
                                        {dollarValueFormatter(totalJointAmountCommitted || 0)} / {dollarValueFormatter(totalAmountCommitted)}  (USD)
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
