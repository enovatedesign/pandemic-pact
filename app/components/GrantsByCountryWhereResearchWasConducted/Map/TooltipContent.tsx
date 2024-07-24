import BaseTooltipContent from '../../TooltipContent'
import { FeatureProperties } from './types'
import { dollarValueFormatter } from '../../../helpers/value-formatters'

interface Props {
    properties: FeatureProperties
    displayWhoRegions: boolean
}

export default function TooltipContent({
    properties,
    displayWhoRegions,
}: Props) {
    const items = [
        {
            label: 'Grants',
            value: `${properties.totalGrants || 0}`,
        },
        {
            label: 'Known Financial Commitments (USD)',
            value: dollarValueFormatter(properties.totalAmountCommitted || 0),
        },
    ]

    return (
        <BaseTooltipContent
            title={properties.name}
            items={items}
            footer={
                <div className="px-4 py-2">
                    <p className="text-right text-sm text-gray-400">
                        Click to explore grants in this{' '}
                        {displayWhoRegions ? 'region' : 'country'}
                    </p>
                </div>
            }
        />
    )
}
