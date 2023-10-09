import {type Filters} from "./filters";

export interface CardProps {
    filteredDataset: any[],
}

export interface CardWithOwnFiltersProps {
    selectedFilters: Filters,
}
