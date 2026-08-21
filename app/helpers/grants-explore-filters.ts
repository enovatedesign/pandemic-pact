import selectOptions from '../../data/dist/select-options.json'

import { grantsFilterableFields } from './filterable-fields'

import {
    AdvancedSearchRow,
    AdvancedSearchState,
    JOINT_FUNDING_FIELD,
    jointFundingFilterOptions,
    SearchParameters,
    SelectedStandardSearchFilters,
} from './search'

/**
 * Which grants filters exist, and how to reconcile a stored search with them.
 *
 * This is deliberately separate from helpers/search.ts: the option data below is
 * over a megabyte, and helpers/search.ts is pulled into the search API routes.
 */

// The Family → Strain cascade is rendered by HierarchicalFiltersBlock rather
// than the flat multi-select loop below, so its fields are listed separately.
const CASCADE_FIELDS = ['Families', 'Pathogens', 'Diseases', 'Strains']

/** Standard search fields, in render order, mapped to their select labels. */
export const standardSearchFields: Record<string, string> = {
    ResearchInstitutionCountry: 'Research Institution Countries',
    ResearchInstitutionRegion: 'Research Institution Regions',
    FunderCountry: 'Funder Countries',
    FunderRegion: 'Funder Regions',
    FundingOrgName: 'Funders',
    ResearchCat: 'Research Categories',
    PolicyRoadmaps: 'Policy Roadmaps',
}

/**
 * Every field the advanced search can build a row from.
 *
 * Driven by the API allowlist rather than by the select options: an unrecognised
 * field is dropped by prepareFilterClause without erroring, so offering one here
 * gives a filter that looks selectable and changes nothing. Fields with no
 * generated options (e.g. GrantID) have nothing to pick, so they are skipped.
 */
export const advancedSearchFields = grantsFilterableFields.filter(
    field => field in selectOptions,
)

const optionValuesByField: Record<string, Set<string>> = Object.fromEntries(
    Object.entries(selectOptions).map(([field, options]) => [
        field,
        new Set((options as { value: string }[]).map(option => option.value)),
    ]),
)

/** Values still offered for a field. A field with no options has none left. */
function keepKnownValues(field: string, values: string[]): string[] {
    const knownValues = optionValuesByField[field]

    return knownValues ? values.filter(value => knownValues.has(value)) : []
}

/**
 * Reconcile a stored or shared search with the filters that currently exist.
 *
 * A retired field or option value can't be rendered by any select, so left in
 * place it would go on narrowing results invisibly. Callers persist the result,
 * which is what makes a stored search self-heal rather than rot.
 */
export function pruneGrantsSearchParameters(
    parameters: SearchParameters,
): SearchParameters {
    return {
        ...parameters,
        standardFilters: pruneStandardFilters(parameters.standardFilters),
        advancedSearch: pruneAdvancedSearch(parameters.advancedSearch),
    }
}

function pruneStandardFilters(
    filters: SelectedStandardSearchFilters,
): SelectedStandardSearchFilters {
    const fields = [...Object.keys(standardSearchFields), ...CASCADE_FIELDS]

    return Object.fromEntries(
        Object.entries(filters ?? {})
            .filter(([field]) => fields.includes(field))
            .map(([field, values]) => [field, keepKnownValues(field, values ?? [])])
            .filter(([, values]) => values.length > 0),
    )
}

function pruneAdvancedSearch(
    advancedSearch: AdvancedSearchState,
): AdvancedSearchState {
    return {
        ...advancedSearch,
        rows: advancedSearch.rows.map(pruneAdvancedSearchRow),
    }
}

function pruneAdvancedSearchRow(row: AdvancedSearchRow): AdvancedSearchRow {
    // An empty field is the state a new row starts in.
    if (!row.field) {
        return row
    }

    // The joint funding row holds a request parameter value rather than filter
    // options, so it is checked against its own list.
    if (row.field === JOINT_FUNDING_FIELD) {
        return {
            ...row,
            values: row.values.filter(value =>
                jointFundingFilterOptions.some(option => option.value === value),
            ),
        }
    }

    if (!advancedSearchFields.includes(row.field)) {
        return {
            ...row,
            field: '',
            values: [],
            subCategoryParent: { field: null, value: null },
            subCategoryChild: { field: null, value: null },
        }
    }

    const values = keepKnownValues(row.field, row.values)

    // The strain cascade only holds while the disease it narrows is still
    // selected and the chosen strain still exists.
    const parentIsSelected =
        row.subCategoryParent.value !== null &&
        values.includes(row.subCategoryParent.value)

    const childIsKnown =
        row.subCategoryChild.value !== null &&
        Boolean(optionValuesByField.Strains?.has(row.subCategoryChild.value))

    return {
        ...row,
        values,
        subCategoryParent: parentIsSelected
            ? row.subCategoryParent
            : { field: null, value: null },
        subCategoryChild:
            parentIsSelected && childIsKnown
                ? row.subCategoryChild
                : { field: null, value: null },
    }
}
