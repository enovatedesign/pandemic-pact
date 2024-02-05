import {useContext} from "react"
import {sumNumericGrantAmounts} from "../../helpers/reducers"
import {GlobalFilterContext} from "../../helpers/filters"
import selectOptions from "../../../data/dist/select-options.json"
import {grantsAndAmountsBarChartColours} from "../../helpers/colours"
import {diseaseColours, diseaseDimColours} from "../../helpers/colours"

import {
    GrantAndFinancialCommitmentBarList,
    GrantAndFinancialCommitmentBarListData,
} from "../GrantAndFinancialCommitmentBarList"

export default function BarChart() {
    const {
        grantsWithKnownAmountsColour,
        grantsWithUnspecifiedAmountsColour,
        amountCommittedColour
    } = grantsAndAmountsBarChartColours

    const {grants} = useContext(GlobalFilterContext)

    const chartData = selectOptions.Disease.map(function (disease) {
        const grantsWithKnownAmounts = grants
            .filter((grant: any) => grant.Disease.includes(disease.value))
            .filter((grant: any) => typeof grant.GrantAmountConverted === "number")

        const grantsWithUnspecifiedAmounts = grants
            .filter((grant: any) => grant.Disease.includes(disease.value))
            .filter((grant: any) => typeof grant.GrantAmountConverted !== "number")

        const moneyCommitted = grantsWithKnownAmounts.reduce(...sumNumericGrantAmounts)

        return {
            "Category Label": disease.label,
            "Category Value": disease.value,
            "Grants With Known Financial Commitments": grantsWithKnownAmounts.length,
            "Grants With Unspecified Financial Commitments": grantsWithUnspecifiedAmounts.length,
            "Total Grants": grantsWithKnownAmounts.length + grantsWithUnspecifiedAmounts.length,
            "Known Financial Commitments (USD)": moneyCommitted,
        }
    }).filter(disease => disease["Total Grants"] > 0)

    return (
        <GrantAndFinancialCommitmentBarList
            data={chartData}
            brightColours={diseaseColours}
            dimColours={diseaseDimColours}
        />
    )
}
