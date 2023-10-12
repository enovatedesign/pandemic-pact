import {type Filters} from "./filters";

export interface CardProps {
    globallyFilteredDataset: any[],
}

export interface CardWithOwnFiltersProps extends CardProps {
    selectedFilters: Filters,
}
