interface StandardFeaturePropertiesProps {
    totalGrants: string
    totalAmountCommitted: string
}

const StandardFeatureProperties = ({
    totalGrants,
    totalAmountCommitted
} : StandardFeaturePropertiesProps) => {
  return (
    <div className="p-4 space-y-2">
        <div className="flex items-center justify-between space-x-4">
            <p className="min-w-0 text-left text-brand-grey-700">Grants</p>

            <div className="min-w-0 flex-1 h-[1px] border-b border-dashed border-brand-grey-300"></div>

            <p className="font-medium tabular-nums text-right whitespace-nowrap text-brand-grey-700">
                {totalGrants}
            </p>
        </div>

        <div className="flex items-center justify-between space-x-4">
            <p className="min-w-0 text-left text-brand-grey-700">
                Known Financial Commitments (USD)
            </p>

            <div className="min-w-0 flex-1 h-[1px] border-b border-dashed border-brand-grey-300"></div>

            <p className="font-medium tabular-nums text-right text-brand-grey-700">
                {totalAmountCommitted}
            </p>
        </div>
    </div>
  )
}

export default StandardFeatureProperties