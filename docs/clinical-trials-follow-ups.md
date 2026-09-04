# Clinical Trials — open follow-ups

Structural and efficiency items deferred from the review of the
`feature/clinical-trials` (Clinical Research Registrations / ICTRP) work. **None is
a live bug.** Re-verified against the code on 2026-09-04; items that have since been
fixed are listed at the bottom so they are not re-raised.

## 1. Grants ↔ clinical-trials duplication (structural)

The CT explore/visualise surfaces are near-clones of their grants counterparts, so
most UI changes have to be made twice and can drift.
`app/clinical-trials/explore/ExplorePageClient.tsx`,
`ClinicalTrialsResultsTable.tsx` and
`app/clinical-trials/visualise/VisualisePageClient.tsx` duplicate the grants search
orchestration, results-table rendering and sidebar boilerplate;
`ClinicalTrialsDownloadButtons.tsx` re-implements
`app/components/DownloadFullDataButton.tsx` and `DownloadFilteredDataButton.tsx`,
and re-declares the two CSV path constants that `app/helpers/export.ts` already
exports as `clinicalTrialsFullDataFilename` / `clinicalTrialsFilteredDataFilename`.
Those exports are live — the four CT visualisation cards pass them to their export
menus — so the same two paths are currently defined twice, once shared and once
inline, and only the explore page uses the inline copy.

Note the shared buttons are **not** reusable as they stand: `DownloadFullDataButton`
takes no props at all and hardcodes `fetchCsv()` (which defaults to the grants CSV)
plus `fullDataFilename`, and `DownloadFilteredDataButton` accepts a
`filteredDataFilename` but still calls a bare `fetchCsv()` and is typed to the grants
`SearchRequestBody`. Parameterising those two is the prerequisite, not an
afterthought — which is most of why the CT versions were written separately.

The CT Viz 4 matrix (`visualisations/InterventionByPathogenFamily.tsx`) and the
grants pandemic-intelligence matrix
(`app/grants/visualise/policy-roadmaps/shared-visualisations/TableVisualisation.tsx`)
now share a source (`public/manual-hierarchy-filters.json`) and have nearly
identical logic — a shared matrix component is the obvious extraction.

Best done as its own behaviour-neutral PR with before/after parity checks: it
touches the live grants pages.

## 2. De-duplicate country codes for the co-located flag (data-dependent)

`scripts/generate/prepare-trials-search.ts` computes `CoLocatedByLocation` from
`ResearchLocationCountry.length > 1` with no de-duplication, so source data
containing a repeated ISO code (`US,US`) would wrongly flag a single-country trial
as co-located. The upstream split already strips empty elements, so this only fires
on genuine duplicates — add a `Set` dedupe if the ICTRP source can produce them.

Viz 1's map breakdown uses the same non-deduped check, so the two agree either way;
there is no map-vs-Explore discrepancy today.

## 3. Strip the BOM in CSV ingestion (robustness, data-dependent)

`scripts/helpers/convert-csv-file-to-json.ts` reads the source as `utf8` and feeds
fast-csv without stripping a leading `﻿`. The current ICTRP export has no BOM,
but it is an externally-managed source: if a future export is saved with one, the
first header becomes `﻿pactid`, the `pactid → TrialID` mapping silently breaks,
and every `_id` becomes undefined — with no error. Cheap insurance, worth applying
to the grants converter too.

## 4. Grants CSV export: unmapped codes export the raw code

`scripts/generate/prepare-csv-export-file.ts` (single-value branch, ~line 150)
falls back to `grant[field]` when a code is absent from the select-options map, so
an unmapped code now exports as the raw code where it previously exported blank.
The array branch immediately above still drops unmapped values via `.filter(v => v)`,
so the two branches disagree.

Decide whether the raw-code fallback is wanted for grants or should be CT-only, and
align the branches. The inline comment's justification is also wrong — `xlsx` omits
`undefined` cells rather than serialising the string `"undefined"` — so fix that
either way.

## 5. Efficiency micro-optimisations (non-blocking)

- **`GeographicDistribution.tsx`** — the country drill-down filters trials with
  `countriesInRegion.includes(code)` inside a loop over every trial. Build a `Set`
  once and use `.has()`. Behaviour-identical; the trivial one to land first.
- **`PhaseDevelopmentStage.tsx`** — each phase bucket re-walks all in-pathway trials
  (`buckets.map(... inPathway.forEach(...))`), recomputed on every tab switch and
  filter change. A single pass deriving each trial's bucket makes it O(trials).
  Verify counts before/after.

## Do NOT re-flag: the dead `'H5N1'` jump-card config

A review pass flagged `resolveJumpCardItems` (`app/visualise/components/helpers.ts`,
consumed by `VisualisationCardLinks.tsx` and `VisualisationJumpMenu.tsx`) as
dropping the "Policy Roadmaps" entry from the jump-bar dropdown on an H5N1 outbreak
page. This was investigated and cleared — **it is a fix, not a regression:**

- The dropdown now respects `showChevron`, and Policy Roadmaps is the only card
  where `showChevron` diverges from `showCard`, and only for H5N1
  (`showCard.H5N1: true`, `showChevron.H5N1: false`). Its H5N1 summary text begins
  "Coming soon:", which is the same intent stated a second way.
- On an H5N1 outbreak page the default content branch renders only
  `id="research-categories"`. There is **no `id="policy-roadmaps"` section anywhere
  in the app**, so the old entry linked to a dead anchor — presumably why
  `showChevron.H5N1` was set `false` in the first place.

Optional cleanup: remove the `'H5N1'` keys and the dead `#policy-roadmaps` URL in
`app/visualise/components/visualisationCardData.ts`, or point them at a real
section if an H5N1 Policy Roadmaps visualisation is ever added.

## Resolved since the review

- **Single source of truth for filter fields** — `app/helpers/filterable-fields.ts`
  is now the shared, React-free list both the server allowlist and the client
  schemas derive from, and the dead CT server-side entries are gone.
- **Dead `searchIndexBaseName` config field** — now read by
  `scripts/generate/prepare-trials-search.ts`.
- **Fail-hard OpenSearch bulk indexing** and **empty-dataset CSV export throwing**
  were flagged as shared-pipeline behaviour changes needing sign-off. Both are
  intended and now carry explanatory comments; `scripts/verify-build-artefacts.ts`
  enforces the same posture (minimum row and record counts) across every dataset.
