import test from 'node:test'
import assert from 'node:assert/strict'
import { getBooleanQuery, getSearchDataset } from '../../app/api/helpers/search'

const grants = getSearchDataset('grants')
const clinicalTrials = getSearchDataset('clinical-trials')

const noFilters = { logicalAnd: false, filters: [] }

function filterMust(query: any) {
    return query.bool.filter.bool.must
}

test('omits the must clause entirely when there is no query string', () => {
    const query = getBooleanQuery('', noFilters, grants)

    assert.equal('must' in query.bool, false)
})

test('rewrites the boolean operators simple_query_string expects', () => {
    const query: any = getBooleanQuery('ebola AND vaccine OR NOT malaria', noFilters, grants)

    assert.equal(query.bool.must.simple_query_string.query, 'ebola + vaccine | -malaria')
})

test('leaves lowercase operators alone', () => {
    const query: any = getBooleanQuery('ebola and vaccine', noFilters, grants)

    assert.equal(query.bool.must.simple_query_string.query, 'ebola and vaccine')
})

test('drops filter rows whose field is not on the dataset allowlist', () => {
    // prepareFilterClause drops unknown fields silently, so a typo'd field must
    // not quietly widen the result set.
    const query = getBooleanQuery('', {
        logicalAnd: false,
        filters: [{ field: 'NotARealField', values: ['x'], logicalAnd: false }],
    } as any, grants)

    assert.deepEqual(filterMust(query), [])
})

test('drops filter rows with no values', () => {
    const query = getBooleanQuery('', {
        logicalAnd: false,
        filters: [{ field: 'Families', values: [], logicalAnd: false }],
    } as any, grants)

    assert.deepEqual(filterMust(query), [])
})

test('combines values within a row with should when the row operator is OR', () => {
    const query = getBooleanQuery('', {
        logicalAnd: false,
        filters: [{ field: 'Families', values: ['a', 'b'], logicalAnd: false }],
    } as any, grants)

    assert.deepEqual(filterMust(query), [
        {
            bool: {
                should: [
                    { bool: { should: [{ term: { Families: 'a' } }, { term: { Families: 'b' } }], minimum_should_match: 1 } },
                ],
                minimum_should_match: 1,
            },
        },
    ])
})

test('combines values within a row with must when the row operator is AND', () => {
    const query = getBooleanQuery('', {
        logicalAnd: false,
        filters: [{ field: 'Families', values: ['a', 'b'], logicalAnd: true }],
    } as any, grants)

    const row = filterMust(query)[0].bool.should[0]

    assert.deepEqual(row, { bool: { must: [{ term: { Families: 'a' } }, { term: { Families: 'b' } }] } })
})

// The regression this file exists for. The row clauses are wrapped in their own
// bool so the global OR stays independent of the joint-funding term appended to
// the same outer `must`. Flatten the wrapper and OR'd rows silently become
// optional in OpenSearch, which only ever shows up as wrong result counts.
test('keeps OR-combined rows in their own bool alongside a joint-funding term', () => {
    const query = getBooleanQuery(
        '',
        {
            logicalAnd: false,
            filters: [
                { field: 'Families', values: ['a'], logicalAnd: false },
                { field: 'FunderCountry', values: ['b'], logicalAnd: false },
            ],
        } as any,
        grants,
        'only-joint-funded-grants',
    )

    const must = filterMust(query)

    assert.equal(must.length, 2, 'expected the row wrapper and the joint-funding term')
    assert.equal(must[0].bool.minimum_should_match, 1, 'row wrapper must stay a should with minimum_should_match')
    assert.equal(must[0].bool.should.length, 2)
    assert.deepEqual(must[1], { term: { JointFunding: true } })
})

test('combines rows with must when the global operator is AND', () => {
    const query = getBooleanQuery('', {
        logicalAnd: true,
        filters: [
            { field: 'Families', values: ['a'], logicalAnd: false },
            { field: 'FunderCountry', values: ['b'], logicalAnd: false },
        ],
    } as any, grants)

    const wrapper = filterMust(query)[0]

    assert.equal(wrapper.bool.must.length, 2)
    assert.equal('should' in wrapper.bool, false)
})

test('excludes joint-funded grants when asked', () => {
    const query = getBooleanQuery('', noFilters, grants, 'exclude-joint-funded-grants')

    assert.deepEqual(filterMust(query), [{ term: { JointFunding: false } }])
})

test('adds no joint-funding term for the default selection', () => {
    const query = getBooleanQuery('', noFilters, grants, 'all-grants')

    assert.deepEqual(filterMust(query), [])
})

test('ignores joint funding on a dataset that does not support it', () => {
    const query = getBooleanQuery('', noFilters, clinicalTrials, 'only-joint-funded-grants')

    assert.deepEqual(filterMust(query), [])
})

test('filters co-located location and institution independently', () => {
    const query = getBooleanQuery('', noFilters, clinicalTrials, 'all-grants', {
        location: 'only-co-located-trials',
    })

    assert.deepEqual(filterMust(query), [{ term: { CoLocatedByLocation: true } }])
})

test('applies both co-located selections when both are set', () => {
    const query = getBooleanQuery('', noFilters, clinicalTrials, 'all-grants', {
        location: 'only-co-located-trials',
        institution: 'exclude-co-located-trials',
    })

    assert.deepEqual(filterMust(query), [
        { term: { CoLocatedByLocation: true } },
        { term: { CoLocatedByInstitution: false } },
    ])
})

test('ignores co-located selections on the grants dataset', () => {
    const query = getBooleanQuery('', noFilters, grants, 'all-grants', {
        location: 'only-co-located-trials',
    })

    assert.deepEqual(filterMust(query), [])
})
