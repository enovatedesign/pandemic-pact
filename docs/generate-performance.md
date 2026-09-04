# Generate performance — constraints to preserve

Reference for anyone changing `npm run generate`. The optimisation work itself is
done (full generate on the GitLab runner: ~10.2 min → ~5.9 min); what follows is
the part that must not be undone by a future "simplification", plus the one
follow-up still on the table.

## Where the time goes

Measured on the GitLab runner after the optimisation work (2026-07); treat as the
shape of the profile rather than current numbers:

| Step | Time | Notes |
| --- | --- | --- |
| Figshare download + CSV→JSON (1.1 GB) | ~52 s | source data |
| `prepareGrants` → `grants.json.gz` | ~67 s | was ~325 s — see below |
| 100DM + PI | ~34 s | folded into the same stream pass |
| `uploadStaticFiles` (pass 1) | ~29 s | aggregates + CSV (113 MB) + CloudFront invalidation |
| `prepareIndividualGrantFiles` | ~41 s | write + incremental S3 upload |
| `prepareSearch` (OpenSearch reindex) | ~95 s | now the largest step; incremental after the first run |
| `uploadStaticFiles` (pass 2) | ~28 s | |

No single step dominates any more. Vercel never runs this — it only takes the
cached path (~3 min). See [`decoupled-build.md`](./decoupled-build.md).

## Why `prepareGrants` looks the way it does

`extractCheckboxAndPrefixFields` (`scripts/helpers/key-mapping.ts`) exists because
the obvious implementation is quadratic. Transforming a grant used to re-scan every
key of a very wide record once per checkbox field, plus three prefix scans —
`O((numCheckboxFields + 3) × numKeys)` per grant, allocating a fresh
`Object.entries` each call. The single-pass version buckets the checked codes in
one walk of the keys: `O(numKeys)`, ~85× faster on the step in isolation.

`convertCheckBoxFieldToArray` / `convertRawGrantKeyToValuesArray` are deliberately
kept alongside it — `prepare-100-days-mission.ts`, `prepare-pandemic-inteligence.ts`
and `prepare-trials.ts` all still call them on their much smaller datasets, and they
are the parity reference. **Do not delete them as dead code.**

`worker_threads` was considered and rejected: with the hotspot gone, the floor is
the serial stream-parse of the 1.1 GB source, which workers would not help. On the
3-core self-hosted runner the marginal gain does not justify the plumbing or the
deterministic-ordering risk.

## Verification discipline for any generate change

Output must stay **byte-identical** to a baseline:

1. Re-run `scripts/verify-prepare-grants-parity.ts` (5,006 grants — edge cases plus
   seeded fuzz — old path vs new).
2. Confirm the Phase-3 manifest hashes are unchanged.

Hash drift means the serialised output changed, which triggers a spurious full
re-upload — so this doubles as a correctness check.

## Remaining follow-up

- **Dedup the two `uploadStaticFiles` passes** — ~57 s of redundant CSV and
  `grants.json` re-upload, plus a duplicate CloudFront invalidation of
  `/<branch>/cache/*`. Both calls sit on the non-cached path in
  `scripts/generate/index.ts` behind the same `shouldUploadConditionsMet` flag, so
  they always both run; the second exists only to pick up `grant-ids.json`, written
  after the first. `uploadStaticFiles` has no change detection — it re-reads and
  re-uploads all 16 files either way. The only sizeable non-parse cost left.
