import { XIcon } from '@heroicons/react/solid'

import InfoModal from '../../../components/InfoModal'
import Button from '../../../components/Button'

export interface CoLocatedFeature {
    name: string
    count: number
    coLocatedCount: number
}

interface Props {
    coLocatedFeatures: CoLocatedFeature[]
}

/**
 * Breakdown of the countries / regions that share multi-location clinical
 * studies with the selected feature. Mirrors the grants JointFeaturesModal, but
 * trials carry no financial figures so only the trial counts are shown.
 */
export default function CoLocatedFeaturesModal({ coLocatedFeatures }: Props) {
    return (
        <InfoModal
            customButton={<Button size="xxsmall">Co-located breakdown</Button>}
            marginX={false}
            customCloseButton={
                <XIcon
                    className="text-brand-grey-700 size-5 hover:scale-[1.2] transition duration-150 absolute top-1 right-1 cursor-pointer"
                    aria-hidden="true"
                />
            }
            removeSpaceY
        >
            <div className="max-h-[60vh] overflow-y-auto rounded">
                <table className="w-full rounded overflow-hidden">
                    <thead className="sticky top-0 z-10 bg-secondary border-b-2 border-white">
                    <tr>
                        <th className="text-left pt-3 !pl-4 !font-bold !text-white border-r-2 border-white whitespace-nowrap">
                            Name
                        </th>
                        <th className="text-left pt-3 !pr-4 !font-bold !text-white whitespace-nowrap">
                            Clinical trials
                            <br />
                            <span className="text-sm">(Co-located / Total per country)</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-primary !pl-4 border-t-2 border-secondary/30">
                    {coLocatedFeatures.map((data, index: number) => {
                        const trClasses = [
                            index !== coLocatedFeatures.length - 1 &&
                                'border-b-2 border-secondary/30',
                        ]
                            .filter(Boolean)
                            .join(' ')

                        const tdClasses = 'text-secondary whitespace-nowrap'

                        return (
                            <tr key={index} className={trClasses}>
                                <td className={`${tdClasses} !pl-4 border-r-2 border-secondary/30`}>
                                    {data.name}
                                </td>

                                <td className={tdClasses}>
                                    {data.coLocatedCount} / {data.count}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
                </table>
            </div>
        </InfoModal>
    )
}
