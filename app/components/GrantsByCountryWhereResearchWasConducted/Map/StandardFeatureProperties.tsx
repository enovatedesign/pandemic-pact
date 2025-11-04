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
        <div className="flex items-center justify-between space-x-8">
            <div className="flex items-center space-x-2">
                <p className="text-left text-brand-grey-700">Grants</p>
            </div>
            
            <div className='h-[1px] w-full border-b border-dashed border-brand-grey-300'></div>

            <div className="flex justify-between items-center gap-x-2">
                <p className="font-medium tabular-nums text-right whitespace-nowrap text-brand-grey-700">
                    {totalGrants}
                </p>
            </div>
        </div>

        <div className="flex items-center justify-between space-x-8">
            <div className="flex items-center space-x-2">
                <p className="text-left text-brand-grey-700 whitespace-nowrap">
                    Known Financial Commitments (USD)
                </p>
            </div>

            <div className='hidden sm:block h-[1px] w-full border-b border-dashed border-brand-grey-300'></div>

            <div className="flex justify-between items-center gap-x-2">
                <p className="font-medium tabular-nums text-right sm:whitespace-nowrap text-brand-grey-700">
                    {totalAmountCommitted}
                </p>
            </div>
        </div>
    </div>
  )
}

export default StandardFeatureProperties