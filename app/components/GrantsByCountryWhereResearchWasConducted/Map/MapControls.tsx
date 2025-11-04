import { useContext } from 'react'
import type { ScaleLogarithmic } from 'd3-scale'
import DoubleLabelSwitch from '../../DoubleLabelSwitch'
import RadioGroup from '../../RadioGroup'
import { SidebarStateContext } from '../../../helpers/filters'
import type { LocationType, MapControlState } from './types'
import ColourScale from './ColourScale'

interface Props {
    mapControlState: MapControlState
    setMapControlState: (state: MapControlState) => void
    setHighlightJointFundedCountries: (value: boolean) => void
    colourScale: ScaleLogarithmic<string, string>
    showColourScaleOnly?: boolean
}

export default function MapControls({
    mapControlState,
    setMapControlState,
    setHighlightJointFundedCountries,
    colourScale,
    showColourScaleOnly = false
}: Props) {
    const { sidebarOpen } = useContext(SidebarStateContext)

    const {
        displayKnownFinancialCommitments,
        displayWhoRegions,
        locationType,
    } = mapControlState

    const setMapControlAndHighlightJointFundedState = (
        newState: MapControlState,
    ) => {
        setMapControlState(newState)

        const displayingByFunderCountry =
            newState.locationType === 'Funder' && !newState.displayWhoRegions

        if (!displayingByFunderCountry) {
            setHighlightJointFundedCountries(false)
        }
    }

    const wrapperClasses = [
        'flex flex-col w-full rounded-md overflow-hidden',
        sidebarOpen ? 'flex-col' : 'xl:flex-row'
    ].filter(Boolean).join(' ')

    return (
        <div className={wrapperClasses}>
            <div
                className={`w-full bg-gradient-to-b from-gray-50 to-gray-100 h-full flex flex-col  ${!sidebarOpen && 'xl:w-4/6'} ${showColourScaleOnly ? 'py-3' : 'pt-3'}`}
            >
                <div className={`w-full flex items-center justify-center ${showColourScaleOnly ? 'flex-col' : ''}`}>
                    <ColourScale
                        colourScale={colourScale}
                        displayKnownFinancialCommitments={
                            displayKnownFinancialCommitments
                        }
                    />
                    
                    {showColourScaleOnly && (
                        <p className='text-brand-grey-600'>
                            Number of Joint Grants
                        </p>
                    )}
                </div>
            </div>
            
            {!showColourScaleOnly && (
                <div className="flex w-full flex-col items-start py-3 xl:py-6 px-4 bg-gradient-to-b from-primary-lightest to-primary-lighter gap-y-2 md:flex-row md:justify-between md:gap-y-0 ignore-in-image-export">
                    <DoubleLabelSwitch
                        checked={displayWhoRegions}
                        onChange={(value: boolean) =>
                            setMapControlAndHighlightJointFundedState({
                                ...mapControlState,
                                displayWhoRegions: value,
                            })
                        }
                        leftLabel="Countries"
                        rightLabel="WHO Regions"
                        screenReaderLabel="Display WHO Regions"
                    />

                    <RadioGroup<LocationType>
                        options={[
                            {
                                label: 'Funder',
                                value: 'Funder',
                            },
                            {
                                label: 'Research Institution',
                                value: 'ResearchInstitution',
                            },
                            {
                                label: 'Research Location',
                                value: 'ResearchLocation',
                            },
                        ]}
                        value={locationType}
                        onChange={(value: LocationType) =>
                            setMapControlAndHighlightJointFundedState({
                                ...mapControlState,
                                locationType: value,
                            })
                        }
                        fieldsetClassName="flex flex-col"
                    />

                    <RadioGroup<boolean>
                        options={[
                            { label: 'Number of grants', value: false },
                            {
                                label: 'Known financial commitments (USD)',
                                value: true,
                            },
                        ]}
                        value={displayKnownFinancialCommitments}
                        onChange={(value: boolean) =>
                            setMapControlAndHighlightJointFundedState({
                                ...mapControlState,
                                displayKnownFinancialCommitments: value,
                            })
                        }
                        fieldsetClassName="flex flex-col"
                    />
                </div>
            )}
        </div>
    )
}
