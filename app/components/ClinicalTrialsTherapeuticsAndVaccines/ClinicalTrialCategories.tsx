import { Fragment } from 'react'

import BarList from '../BarList/BarList'
import BarListRow from '../BarList/BarListRow'
import BarListRowHeading from '../BarList/BarListRowHeading'
import { BarListDatum, getColoursByField } from '@/app/helpers/bar-list'

interface Props {
    chartData: any
}

const ClinicalTrialCategories = ({
    chartData,
}: Props) => {

    const { brightColours, dimColours } = getColoursByField('ClinicalTrialPhase')

    return (
        <>
            <BarList
                data={chartData}
                brightColours={brightColours}
                dimColours={dimColours}
            >
                {chartData.map((datum: BarListDatum, index: number) => (
                    <Fragment key={index}>
                        <Fragment key={index}>
                            <BarListRowHeading>
                                <p className="bar-chart-category-label text-gray-600 text-sm">
                                    {datum['Category Label']}
                                </p>
                            </BarListRowHeading>

                            <BarListRow dataIndex={index} />
                        </Fragment>
                    </Fragment>
                ))}
            </BarList>
        </>
    )
}


export default ClinicalTrialCategories