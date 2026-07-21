import type { ScaleLogarithmic } from 'd3-scale'
import type { rrnaMapControlState } from '../../../../helpers/types'
import ColourScale from './ColourScale'
import DoubleLabelSwitch from '@/app/components/DoubleLabelSwitch'

interface Props {
    mapControlState: rrnaMapControlState
    setMapControlState: (state: rrnaMapControlState) => void
    colourScale: ScaleLogarithmic<string, string>
}

export default function MapControls({
    mapControlState,
    setMapControlState,
    colourScale,
}: Props) {
    const { locationType } = mapControlState
    
    return (
        <div className="flex flex-col w-full rounded-md relative z-40">
            <div className="w-full bg-gradient-to-b from-gray-50 to-gray-100 h-full flex flex-col pt-3">
                <div className="flex flex-col items-center justify-center">
                    <p className="text-brand-grey-600">
                        Number of studies published
                    </p>
                    <ColourScale
                        colourScale={colourScale}
                    />
                </div>
            </div>

            <div className="py-3 xl:py-6 px-4 bg-gradient-to-b from-primary-lightest to-primary-lighter ignore-in-image-export rounded-b-md">
                <DoubleLabelSwitch
                    checked={locationType === 'regions'}
                    onChange={(value: boolean) =>
                        setMapControlState({
                            ...mapControlState,
                            locationType: value === false ? 'countries' : 'regions',
                        })
                    }
                    leftLabel="Countries"
                    rightLabel="WHO Regions"
                    screenReaderLabel="Display WHO Regions"
                />
            </div>
        </div>
    )
}
