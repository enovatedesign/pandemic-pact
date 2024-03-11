import { useContext } from 'react'
import { GlobalFilterContext } from '../../helpers/filters'
import {
    GrantAndFinancialCommitmentBarList,
    GrantAndFinancialCommitmentBarListData,
} from '../GrantAndFinancialCommitmentBarList'
import { sumNumericGrantAmounts } from '../../helpers/reducers'
import selectOptions from '../../../data/dist/select-options.json'

import {
    researchCategoryColours,
    researchCategoryDimColours,
} from '../../helpers/colours'

interface Props {
    chartData: GrantAndFinancialCommitmentBarListData
}

export default function BarChart({ chartData }: Props) {
    const subCharts = chartData.map(data => {
        return <SubCategoryBarChart researchCategory={data['Category Value']} />
    })

    console.log(subCharts)

    return (
        <GrantAndFinancialCommitmentBarList
            data={chartData}
            brightColours={researchCategoryColours}
            dimColours={researchCategoryDimColours}
            // subCharts={subCharts}
        />
    )
}

function SubCategoryBarChart({
    researchCategory,
}: {
    researchCategory: string
}) {
    const { grants } = useContext(GlobalFilterContext)

    const chartData = selectOptions.ResearchSubcat.filter(
        ({ parent }: { parent: string }) => parent === researchCategory
    ).map(function (researchSubCategory) {
        const grantsWithKnownAmounts = grants
            .filter((grant: any) =>
                grant.ResearchCat.includes(researchSubCategory.value)
            )
            .filter(
                (grant: any) => typeof grant.GrantAmountConverted === 'number'
            )

        const grantsWithUnspecifiedAmounts = grants
            .filter((grant: any) =>
                grant.ResearchCat.includes(researchSubCategory.value)
            )
            .filter(
                (grant: any) => typeof grant.GrantAmountConverted !== 'number'
            )

        const moneyCommitted = grantsWithKnownAmounts.reduce(
            ...sumNumericGrantAmounts
        )

        return {
            'Category Value': researchSubCategory.value,
            'Category Label': researchSubCategory.label,
            'Grants With Known Financial Commitments':
                grantsWithKnownAmounts.length,
            'Grants With Unspecified Financial Commitments':
                grantsWithUnspecifiedAmounts.length,
            'Total Grants':
                grantsWithKnownAmounts.length +
                grantsWithUnspecifiedAmounts.length,
            'Known Financial Commitments (USD)': moneyCommitted,
        }
    })

    return (
        <GrantAndFinancialCommitmentBarList
            data={chartData}
            brightColours={researchCategoryColours}
            dimColours={researchCategoryDimColours}
        />
    )
}
