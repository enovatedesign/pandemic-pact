import { availableClinicalTrialsFilters } from '../../helpers/filters'

import { CtSearchParameters } from './search'

/**
 * Reconcile a stored or shared search with the filters that currently exist, so
 * a retired field stops narrowing results invisibly. Callers persist the result,
 * which is what makes a stored search self-heal rather than rot.
 *
 * Only fields can be checked here — CT option values are fetched at runtime, so
 * retired values are dropped by each select once its options have loaded.
 */
export function pruneCtSearchParameters(
    parameters: CtSearchParameters,
): CtSearchParameters {
    const schema = availableClinicalTrialsFilters()

    const standardFields = schema
        .filter(({ advanced }) => !advanced)
        .map(({ field }) => field)

    const advancedFields = schema.map(({ field }) => field)

    return {
        ...parameters,
        standardFilters: Object.fromEntries(
            Object.entries(parameters.standardFilters ?? {}).filter(
                ([field, values]) =>
                    standardFields.includes(field) && (values ?? []).length > 0,
            ),
        ),
        advancedSearch: {
            ...parameters.advancedSearch,
            rows: parameters.advancedSearch.rows.map(row =>
                // An empty field is the state a new row starts in.
                !row.field || advancedFields.includes(row.field)
                    ? row
                    : { ...row, field: '', values: [] },
            ),
        },
    }
}
