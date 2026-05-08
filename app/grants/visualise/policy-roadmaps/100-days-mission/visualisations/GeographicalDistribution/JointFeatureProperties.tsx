import { dollarValueFormatter } from "@/app/helpers/value-formatters"

interface JointFeaturePropertiesProps {
    jointFundedProperties: any[]
    totalGrants: string
    totalAmountCommitted: string
    showCapacityStrengthening?: boolean
}

const JointFeatureProperties = ({
    jointFundedProperties,
    totalGrants,
    totalAmountCommitted,
    showCapacityStrengthening = false,
}: JointFeaturePropertiesProps) => {

    const totalGrantsTitle = showCapacityStrengthening ? 
        'Number of Capacity Strengthening Grants / Total Number of Grants' : 
        'Number of Joint Grants / Total Number of Grants'
        
    return (
        <div className="p-4 space-y-2">
            <div>
                <div className="flex items-center justify-between space-x-8">
                    <div className="flex items-center space-x-2">
                        <p className="text-left text-brand-grey-700 whitespace-nowrap">
                            {totalGrantsTitle}
                        </p>
                    </div>

                    <div className="h-[1px] w-full border-b border-dashed border-brand-grey-300"></div>

                    <div className="flex justify-between items-center gap-x-2">
                        <p className="font-medium tabular-nums text-right whitespace-nowrap text-brand-grey-700">
                            {totalGrants}
                        </p>
                    </div>
                </div>

                {jointFundedProperties.map(({ name, totalJointGrants }) => (
                    <div
                        key={name}
                        className="ml-4 flex items-center justify-between space-x-8"
                    >
                        <div className="flex items-center space-x-2">
                            <p className="text-left text-brand-grey-700 whitespace-nowrap">
                                {name}
                            </p>
                        </div>

                        <div className="h-[1px] w-full border-b border-dashed border-brand-grey-300"></div>

                        <div className="flex justify-between items-center gap-x-2">
                            <p className="font-medium tabular-nums text-right whitespace-nowrap text-brand-grey-700">
                                {totalJointGrants}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

                <div>
                    <div className="flex items-center justify-between space-x-8">
                        <div className="flex items-center space-x-2">
                            <p className="text-left text-brand-grey-700 whitespace-nowrap">
                                Joint Financial Commitments / Total Financial
                                Commitments for Country
                            </p>
                        </div>

                        <div className="hidden sm:block h-[1px] w-full border-b border-dashed border-brand-grey-300"></div>

                        <div className="flex justify-between items-center gap-x-2">
                            <p className="font-medium tabular-nums text-right sm:whitespace-nowrap text-brand-grey-700">
                                {totalAmountCommitted}
                            </p>
                        </div>
                    </div>

                {jointFundedProperties.map(
                    ({ name, totalJointAmountCommitted }) => (
                        <div
                            key={name}
                            className="ml-4 flex items-center justify-between space-x-8"
                        >
                            <div className="flex items-center space-x-2">
                                <p className="text-left text-brand-grey-700 whitespace-nowrap">
                                    {name}
                                </p>
                            </div>

                            <div className="h-[1px] w-full border-b border-dashed border-brand-grey-300"></div>

                            <div className="flex justify-between items-center gap-x-2">
                                <p className="font-medium tabular-nums text-right whitespace-nowrap text-brand-grey-700">
                                    {dollarValueFormatter(
                                        totalJointAmountCommitted || 0
                                    )}
                                </p>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    )
}

export default JointFeatureProperties
