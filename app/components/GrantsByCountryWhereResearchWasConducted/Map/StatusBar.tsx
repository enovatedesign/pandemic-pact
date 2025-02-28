import { dollarValueFormatter } from '../../../helpers/value-formatters'
import Button from '../../../components/Button'
import Switch from '../../../components/Switch'
import type { FeatureProperties } from './types'
import JointFeaturesModal from './JointFeaturesModal'
import { XIcon } from '@heroicons/react/solid'

interface Props {
    selectedFeatureProperties: FeatureProperties
    setSelectedFeatureId: (featureId: string | null) => void
    highlightJointFundedCountries: boolean
    setHighlightJointFundedCountries: (value: boolean) => void
    grantField: string
}

export default function StatusBar({
    selectedFeatureProperties,
    setSelectedFeatureId,
    highlightJointFundedCountries,
    setHighlightJointFundedCountries,
    grantField,
}: Props) {
    const viewButtonQueryFilters = {
        [grantField]: [selectedFeatureProperties.id],
    }

    const allowHighlightingJointFundedCountries = grantField === 'FunderCountry'

    let viewButtonHref =
        '/grants?filters=' + JSON.stringify(viewButtonQueryFilters)

    if (highlightJointFundedCountries) {
        viewButtonHref += '&jointFunding=only-joint-funded-grants'
    }

    const jointGrantsTotalNumber = selectedFeatureProperties.totalJointGrants
    const grantsTotalNumber = selectedFeatureProperties.totalGrants

    let totalGrants: string

    if (
        highlightJointFundedCountries &&
        typeof jointGrantsTotalNumber === 'number'
    ) {
        totalGrants = `${jointGrantsTotalNumber} / ${grantsTotalNumber}`
    } else {
        totalGrants = `${grantsTotalNumber}`
    }

    let totalAmountCommitted: string

    if (
        highlightJointFundedCountries &&
        typeof selectedFeatureProperties.totalJointAmountCommitted === 'number'
    ) {
        totalAmountCommitted = `${dollarValueFormatter(
            selectedFeatureProperties.totalJointAmountCommitted,
        )} / ${dollarValueFormatter(
            selectedFeatureProperties.totalAmountCommitted,
        )}`
    } else {
        totalAmountCommitted = dollarValueFormatter(
            selectedFeatureProperties.totalAmountCommitted,
        )
    }

    const shouldShowJointGrantsLink = typeof jointGrantsTotalNumber === 'number' && jointGrantsTotalNumber > 0
    const shouldShowGrantsLink = typeof grantsTotalNumber === 'number' && grantsTotalNumber > 0

    const shouldShowJointFeaturesModal =
        highlightJointFundedCountries &&
        typeof selectedFeatureProperties.jointFeatureProperties === 'object' &&
        selectedFeatureProperties.jointFeatureProperties.length > 0

    const wrapperClasses = [
        'w-full py-2 rounded-lg text-sm shadow-lg',
        'border border-brand-grey-200',
        'lg:max-w-3xl'
    ].join(' ')

    return (
        <div className="w-full flex justify-center">
            <div className={wrapperClasses}>
                <div className="pb-2 border-b border-brand-grey-200 px-4 flex justify-between items-center">
                    <p className="font-medium text-brand-grey-700">
                        {selectedFeatureProperties.name}
                    </p>

                    <button
                        onClick={() => {
                            setSelectedFeatureId(null)
                            setHighlightJointFundedCountries(false)
                        }}
                        aria-label='Close map content'
                    >
                        <XIcon className="text-brand-grey-700 size-4 hover:scale-[1.2] transition duration-150" aria-hidden="true"/>
                    </button>
                </div>

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

                <div className="px-4 flex max-sm:flex-col max-sm:space-y-2 max-sm:items-center sm:flex-row sm:justify-between">

                    {allowHighlightingJointFundedCountries && (
                        <div className="flex items-center gap-x-2">
                            <Switch
                                checked={highlightJointFundedCountries}
                                onChange={setHighlightJointFundedCountries}
                                label="Show Joint-funded Countries"
                                theme="light"
                                textClassName="text-brand-grey-700"
                            />

                        </div>
                    )}

                    <div className="flex flex-col gap-2 md:ml-auto md:flex-row">
                        {shouldShowJointFeaturesModal && (
                            <JointFeaturesModal
                                selectedFeatureProperties={
                                    selectedFeatureProperties
                                }
                            />
                        )}

                        {(allowHighlightingJointFundedCountries && highlightJointFundedCountries && shouldShowJointGrantsLink) &&
                            <Button size="xxsmall" href={viewButtonHref}>
                                Explore Joint-funded Grants
                            </Button>
                        }

                        {(shouldShowGrantsLink && !highlightJointFundedCountries) && (
                            <Button size="xxsmall" href={viewButtonHref}>
                                Explore Grants
                            </Button>
                        )}
                    </div>
                    
                </div>
            </div>
        </div>
    )
}
