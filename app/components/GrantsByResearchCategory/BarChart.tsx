import {
    GrantAndFinancialCommitmentBarList,
    GrantAndFinancialCommitmentBarListData,
} from "../GrantAndFinancialCommitmentBarList"

import {researchCategoryColours, researchCategoryDimColours} from "../../helpers/colours"

interface Props {
    chartData: GrantAndFinancialCommitmentBarListData,
}

export default function BarChart({chartData}: Props) {
    return (
        <GrantAndFinancialCommitmentBarList
            data={chartData}
            brightColours={researchCategoryColours}
            dimColours={researchCategoryDimColours}
        />
    )
}
