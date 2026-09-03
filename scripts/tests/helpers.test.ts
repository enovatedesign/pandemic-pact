import test from 'node:test'
import assert from 'node:assert/strict'
import { normaliseBranchName } from '../../app/helpers/normalise-branch-name'
import { resolveTrendStartYear } from '../helpers/trend-start-year'

// normaliseBranchName is shared by the indexer and the running app. If the two
// ever disagree the app queries an OpenSearch index the indexer never wrote to,
// and the S3 cache prefix stops matching — both fail silently as "no data".

test('strips the git refs prefix', () => {
    assert.equal(normaliseBranchName('refs/heads/develop'), 'develop')
})

test('lowercases and replaces path separators', () => {
    assert.equal(normaliseBranchName('feature/Clinical-Trials'), 'feature-clinical-trials')
})

test('replaces every character outside a-z0-9-', () => {
    assert.equal(normaliseBranchName('fix/PACT_123.4'), 'fix-pact-123-4')
})

test('truncates to 63 characters', () => {
    const branch = `feature/${'a'.repeat(100)}`
    const result = normaliseBranchName(branch)

    assert.equal(result.length, 63)
    assert.equal(result, `feature-${'a'.repeat(55)}`)
})

test('leaves an already-normalised branch untouched', () => {
    assert.equal(normaliseBranchName('develop'), 'develop')
})

// resolveTrendStartYear guards a bug that has already happened once: the source
// data uses empty strings for missing years and Number('') is 0, so a plain ??
// leaked a bogus year 0 past the downstream >= 2020 filters.

test('prefers the grant start year when it is 2020 or later', () => {
    assert.equal(
        resolveTrendStartYear({ grant_start_year: 2021, publication_year_of_award: 2019 }),
        2021,
    )
})

test('falls back to the publication year when the start year predates 2020', () => {
    assert.equal(
        resolveTrendStartYear({ grant_start_year: 2018, publication_year_of_award: 2022 }),
        2022,
    )
})

test('treats an empty string as missing rather than year zero', () => {
    assert.equal(
        resolveTrendStartYear({ grant_start_year: '', publication_year_of_award: 2021 }),
        2021,
    )
})

test('returns null when neither field yields a usable year', () => {
    assert.equal(resolveTrendStartYear({ grant_start_year: '', publication_year_of_award: '' }), null)
    assert.equal(resolveTrendStartYear({}), null)
    assert.equal(
        resolveTrendStartYear({ grant_start_year: 'not a year', publication_year_of_award: null }),
        null,
    )
})

test('never returns zero or a negative year', () => {
    assert.equal(resolveTrendStartYear({ grant_start_year: 0, publication_year_of_award: 0 }), null)
    assert.equal(resolveTrendStartYear({ grant_start_year: -1, publication_year_of_award: -5 }), null)
})

test('accepts numeric strings', () => {
    assert.equal(
        resolveTrendStartYear({ grant_start_year: '2023', publication_year_of_award: '2019' }),
        2023,
    )
})
