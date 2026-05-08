import { datasets } from '../helpers/datasets'
import DatasetCard, { Mode } from './DatasetCard'

interface Props {
    mode: Mode
    onSelect: () => void
}

const headingByMode: Record<Mode, string> = {
    visualise: 'Visualise a dataset',
    explore: 'Explore a dataset',
}

const descriptionByMode: Record<Mode, string> = {
    visualise: 'Choose the dataset you want to visualise.',
    explore: 'Choose the dataset you want to explore.',
}

export default function DatasetPickerPanel({ mode, onSelect }: Props) {
    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h3 className="text-white lg:text-secondary text-base sm:text-lg">
                    {headingByMode[mode]}
                </h3>
                <p className="text-white/70 lg:text-secondary/70 text-sm">
                    {descriptionByMode[mode]}
                </p>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {datasets.map(dataset => (
                    <li key={dataset.key}>
                        <DatasetCard
                            dataset={dataset}
                            mode={mode}
                            onSelect={onSelect}
                            compact
                            variant="inline"
                        />
                    </li>
                ))}
            </ul>
        </div>
    )
}
