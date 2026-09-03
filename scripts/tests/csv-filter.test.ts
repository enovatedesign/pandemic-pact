import test from 'node:test'
import assert from 'node:assert/strict'
import { filterCsv } from '../../app/helpers/csv-filter'

// filterCsv underpins every filtered export. It matches on the raw first column
// rather than parsing, so the invariant it depends on — id is column one — is
// asserted at build time by scripts/verify-build-artefacts.ts.

const csv = ['GrantID,Title,Amount', 'G1,Alpha,100', 'G2,Beta,200', 'G3,Gamma,300'].join('\n')

test('keeps the header row even when nothing matches', () => {
    assert.equal(filterCsv(csv, []), 'GrantID,Title,Amount')
})

test('keeps only the rows whose first column matches', () => {
    assert.equal(filterCsv(csv, ['G1', 'G3']), 'GrantID,Title,Amount\nG1,Alpha,100\nG3,Gamma,300')
})

test('does not match an id that is a prefix of another id', () => {
    const rows = ['GrantID,Title', 'G1,Alpha', 'G10,Ten'].join('\n')

    // Without the trailing comma in the comparison, "G1" would also match "G10".
    assert.equal(filterCsv(rows, ['G1']), 'GrantID,Title\nG1,Alpha')
})

test('does not match an id appearing in a later column', () => {
    const rows = ['GrantID,RelatedID', 'G1,G2', 'G3,G4'].join('\n')

    assert.equal(filterCsv(rows, ['G2']), 'GrantID,RelatedID')
})

test('drops the trailing empty line produced by a trailing newline', () => {
    assert.equal(filterCsv(`${csv}\n`, ['G2']), 'GrantID,Title,Amount\nG2,Beta,200')
})

test('drops rows with no comma at all', () => {
    const rows = ['GrantID,Title', 'G1,Alpha', 'malformed'].join('\n')

    assert.equal(filterCsv(rows, ['G1', 'malformed']), 'GrantID,Title\nG1,Alpha')
})

test('does not match a quoted first column', () => {
    // A quoted id would need real CSV parsing. Documented as a known limitation:
    // the exports do not quote their id column, and the build asserts that the
    // first column is the id field.
    const rows = ['GrantID,Title', '"G1",Alpha'].join('\n')

    assert.equal(filterCsv(rows, ['G1']), 'GrantID,Title')
})

test('handles an id list far larger than the row count', () => {
    const ids = Array.from({ length: 50000 }, (unused, index) => `G${index}`)

    assert.equal(filterCsv(csv, ids), 'GrantID,Title,Amount\nG1,Alpha,100\nG2,Beta,200\nG3,Gamma,300')
})
