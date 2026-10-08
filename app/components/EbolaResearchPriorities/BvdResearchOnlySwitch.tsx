import { Filters } from '../../helpers/filters'
import Switch from '../Switch'

interface Props {
    selectedFilters: Filters
    setSelectedFilters: (filters: Filters) => void
}

// Shared links made before this filter existed have no BvdResearchAward key
export default function BvdResearchOnlySwitch({ selectedFilters, setSelectedFilters }: Props) {
    const checked = (selectedFilters.BvdResearchAward?.values.length ?? 0) > 0

    return (
        <div className="flex flex-col space-y-2 w-full">
            <p className="text-white">Filter by BVD Research Only</p>

            {/* The heading above is the visible label; Switch still needs one for its accessible name */}
            <Switch
                checked={checked}
                onChange={value => setSelectedFilters({
                    ...selectedFilters,
                    BvdResearchAward: { values: value ? ['1'] : [], excludeGrantsWithMultipleItems: false },
                })}
                label="BVD Research Only"
                textClassName="sr-only"
            />
        </div>
    )
}
