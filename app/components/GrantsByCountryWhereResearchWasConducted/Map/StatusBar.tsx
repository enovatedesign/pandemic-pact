import type { FeatureProperties } from './types'

interface Props {
    selectedFeature: FeatureProperties
}

export default function StatusBar({ selectedFeature }: Props) {
    return <p>{selectedFeature.name}</p>
}
