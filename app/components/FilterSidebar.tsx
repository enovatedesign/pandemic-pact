import FunderSelect from "./FunderSelect"

export interface FilterSidebarProps {
    setSelectedFunders: (funders: string[]) => void,
}

export const FilterSidebar = ({setSelectedFunders}: FilterSidebarProps) => (
    <FunderSelect
        setSelectedFunders={setSelectedFunders}
    />
)
