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
}

export default function MapControls({
    mapControlState,
    setMapControlState,
    setHighlightJointFundedCountries,
    colourScale,
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

    return (
        <div
            className={`flex flex-col w-full rounded-md overflow-hidden ${
                sidebarOpen ? 'flex-col' : 'xl:flex-row'
            }`}
        >
            <div
                className={`w-full ${
                    !sidebarOpen && 'xl:w-4/6'
                } bg-gradient-to-b from-gray-50 to-gray-100 h-full flex flex-col pt-3`}
            >
                <div className="flex items-center justify-center">
                    <ColourScale
                        colourScale={colourScale}
                        displayKnownFinancialCommitments={
                            displayKnownFinancialCommitments
                        }
                    />
                </div>
            </div>

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
        </div>
    )
}
