# Next.js 16 upgrade — staged migration tracker

**Status: complete and green on `feature/next-js-upgrade`; not yet reviewed or merged.** A working tracker for the `next@14.2.5` → `next@16.3.4`
migration, to be ticked off as each phase lands. It is not a reference for how the
app works — once the upgrade is done this file should be deleted, or rewritten as
a short reference covering whatever the migration left behind.

Unlike the other docs here it uses checkboxes, because it tracks work in progress
rather than describing a finished mechanism.

## Why

`next@14.2.5` / `react@18.3.1` is two majors behind and out of active support. The
Next.js API changes are small and well understood — the real work is React 19,
which refuses to install alongside five packages whose peer ranges stop at React
18. All five are UI libraries, so the risk sits almost entirely in the rendering
layer, which is the part of the app the test suite does not currently reach. That
is why the first phase adds tests rather than changing a version number.

## Scope decisions

Taken up front, recorded so they are not relitigated mid-migration:

- **Only the packages React 19 blocks get bumped.** `@heroicons/react` v1 (70
  files, every import path changes, outline icons visibly change stroke weight),
  `react-tooltip` 5, `swiper` 11 and `deck.gl` 9.0 all install fine under React 19
  and are deliberately left alone. They are stale, but they are separate work.
- **The homepage globe stays.** `app/components/RotatingGlobe.tsx` is the only
  consumer of `three`, `@react-three/fiber` and `@react-three/drei`. The three.js
  stack is bumped rather than the component deleted, so the upgrade carries no
  design decisions.
- **The extended browser suite does not become a pipeline gate.** It runs locally
  through the migration. `.gitlab-ci.yml` changes only where `next lint` is removed.
- **Staged through Next 15**, on one branch, so React/dependency breakage and
  Next-API breakage are separately bisectable.

## Target versions

| Package | From | To | Why |
| --- | --- | --- | --- |
| `next` | 14.2.5 | 16.3.4 | the upgrade |
| `react` / `react-dom` | 18.3.1 | 19.2.8 | required by Next 16 |
| `@types/react` / `@types/react-dom` | 18.3.3 / 18.3.0 | 19.2.18 / 19.2.7 | |
| `typescript` | 5.3.3 | 5.9.3 | **not** 6.x/7.x — 7.0.2 is the Go rewrite |
| `eslint` | 8.57.0 | 9.x | `eslint-config-next@16` peers `eslint >=9` |
| `eslint-config-next` | 14.2.5 | 16.3.4 | |
| `@headlessui/react` | 1.7.19 | 2.2.10 | peer was `^16 \|\| ^17 \|\| ^18` |
| `recharts` | 2.12.7 | 3.10.1 | peer stopped at 18 |
| `react-select` | 5.8.0 | 5.10.2 | peer stopped at 18 |
| `@react-spring/web` | 9.7.3 | 10.1.2 | peer stopped at 18 |
| `next-seomatic` | 0.1.5 | 0.1.7 | 0.1.7 peers `next ^16`, `react ^19` |
| `@next/third-parties` | 14.2.5 | 16.3.4 | pinned to the Next major |
| `@react-three/fiber` | 8.16.8 | 9.7.0 | fiber 9 peers `react >=19 <19.3` |
| `@react-three/drei` | 9.108.3 | 10.7.8 | pairs with fiber 9 |
| `three` / `@types/three` | 0.166.1 | 0.185.x | needed by fiber 9 / drei 10 |

`next-seomatic` is worth a note. At 0.1.5 it peered `next: ^13.4 || ^14` and
`react: ^18`, blocking both halves of this upgrade on an unmaintained package, and
the obvious fix was to inline its one `getMetadata` call. 0.1.7 widened both peers,
so it is now an ordinary version bump. **Do not inline it.**

## Phase 0 — extend the test backstop

No version numbers change here. `npm test` covers three pure helpers and no React
at all, and the Playwright specs assert dataset loading and chart *presence* on two
visualise pages. What this upgrade threatens is interactive widget behaviour, and
none of that is covered today.

### Prerequisite

- [x] Add a conditional `webServer` block to `playwright.config.ts` that starts
      `next start` when `SMOKE_BASE_URL` is unset, with
      `reuseExistingServer: !process.env.CI`. The deployed-URL path must behave
      exactly as it does now, so the `smoke_review` / `smoke_develop` /
      `smoke_production` jobs are unaffected. Without this the suite cannot run
      against a local build and the whole backstop is unusable during the migration.

### Tripwire

- [x] Extend `collectPageErrors` in `tests/e2e/helpers.ts` with an opt-in, filtered
      console-error assertion. Its docblock records a deliberate decision not to
      gate on console errors because third-party tags are too noisy — keep that,
      and add a narrow match for React / Headless UI / recharts warnings. React 19
      and the dependency majors announce most of their problems there, and those
      problems never throw.

### New specs

One per uncovered surface, each named for the library it protects:

- [x] `tests/e2e/homepage.spec.ts` — `/` renders and the hero `<canvas>` mounts.
      No spec visits the homepage today, so `RotatingGlobe` and the react-spring
      wrappers in `app/HomepageClient.tsx` have no coverage at all.
- [x] `tests/e2e/visualisation-card.spec.ts` — Headless UI `Tab`. Switch tabs on a
      card on `/grants/visualise`; assert the panel content changes and a chart is
      present in the newly-selected panel. `Tab` sits on every visualisation card
      via `app/components/VisualisationCard.tsx`, so this is the widest blast
      radius in the Headless UI 2 bump.
- [x] `tests/e2e/filters.spec.ts` — Headless UI `Dialog` plus react-select. Open a
      filter sidebar, pick an option in a `MultiSelect`, assert the results change,
      close it and assert focus is restored. Covers
      `app/clinical-trials/visualise/ClinicalTrialsFilterSidebar.tsx`,
      `app/components/FilterSidebar.tsx` and `app/components/MultiSelect.tsx`.
- [x] Extend `tests/e2e/export.spec.ts` with the PNG path alongside the CSV one.
      Exercises `ExportMenu` (Headless UI `Transition`) and
      `app/components/ExportMenu/ExportImageMenuItem.tsx` (~line 129), which reaches
      into deck.gl internals via `deckGlRef.current.deck.redraw('screenshot')` —
      the pattern most exposed to React 19's ref changes.
- [x] `tests/e2e/charts.spec.ts` — assert charts have real geometry rather than an
      empty surface, and cover the `Sankey` in
      `app/components/RegionalFlowOfGrantsCard.tsx` specifically. Its hand-written
      `SankeyNode` / `SankeyLink` renderers are typed `props: any`, so **`tsc`
      cannot see a recharts 3 contract change there.**
- [x] `tests/e2e/detail-pages.spec.ts` — a grant and a clinical-trial detail page
      render in a browser. These are the routes the async `params` migration
      rewrites in Phase 3, and today they are only checked over HTTP by
      `scripts/smoke-test.ts`.
- [x] `tests/e2e/cms-page.spec.ts` — one ContentBuilder page, covering the ten
      react-spring blocks and the swiper carousels no spec currently visits.

### Baseline

- [x] Run the full suite against the current Next 14 / React 18 build and record
      the result. This is the reference point the migration is measured against —
      a spec that was already red beforehand must not be read as a regression later.

**Baseline recorded 2026-09-04**, on `next@14.2.13` / `react@18.3.1`, against a
local `next start`:

| Check | Result |
| --- | --- |
| `npx playwright test` | 15 passed, 0 failed (stable over two consecutive runs) |
| `npm test` | 34 passed |
| `npx tsc --noEmit` | clean |
| `npx next lint` | warnings only, no errors — all pre-existing `react-hooks/exhaustive-deps` |
| `npx next build` | succeeds |

Anything that deviates from this after a phase is a regression introduced by that
phase. The lint warnings are the pre-existing set and are **not** part of this
migration's scope.

Two things worth knowing before writing these. The visualise and explore specs need
generated data and OpenSearch, the same as `npm run dev`. And prefer role and text
selectors over recharts' internal class names where there is a choice: the existing
suite keys on `.recharts-surface`, and recharts 3 may rename internal classes, so
**some spec churn in Phase 2 is expected and is not automatically a product bug.**

## Phase 1 — delete dead code

Three dependencies and one file are unused. Removing them first takes one hard
React 19 blocker off the board for free.

- [x] Delete `app/components/HtmlHead.tsx`. It imports the Pages-Router-only
      `next/head`, carries its own comment saying it does not work, and has zero
      importers. Drop `html-react-parser` with it — that file is its only consumer,
      and its peer range stops at React 18.
- [x] Drop `@vercel/og`. Zero usages; `app/api/og/route.tsx` imports
      `ImageResponse` from `next/og` instead.
- [x] Drop `@fortawesome/react-fontawesome`. Zero usages, and its required peer
      `@fortawesome/fontawesome-svg-core` is not installed, so it cannot currently
      work at all.
- [x] Add explicit type imports to the 11 files that reference `React.*` through
      the `@types/react` UMD global without importing React: `app/layout.tsx`,
      `app/components/{FilterSidebar,InteractiveBackground,InfoModal,ConditionalWrapper,SearchInput}.tsx`,
      `app/components/ContentBuilder/Common/Card.tsx`,
      `app/components/ExportMenu/{ExportMenu,ExportDataMenuItem,Button}.tsx` and
      `app/clinical-trials/explore/ClinicalTrialsSearchInput.tsx`.
      `export as namespace React` survives in `@types/react` 19 so these should keep
      compiling, but `next.config.js` sets `typescript.ignoreBuildErrors: false`,
      which turns any regression here into a failed build rather than a red squiggle.
- [x] Bump `typescript` 5.3.3 → 5.9.3 and confirm `tsconfig.json` and
      `tsconfig-scripts.json` both still pass.

Two things Phase 1 turned up that were not in the plan:

**`@types/node` had to move too.** TypeScript 5.7 made the typed-array libs generic
(`Uint8Array<ArrayBufferLike>`), and `@types/node@20`'s non-generic `Buffer` no
longer satisfies them. `@types/node` was bumped 20 → 22, which matches
`engines.node: 22.x` anyway. That left one real type error in
`scripts/verify-build-artefacts.ts`, where a `createReadStream` `data` handler was
annotated `(chunk: Buffer)` against a `string | Buffer` signature — narrowed at the
call site with a comment recording why the string arm cannot occur.

**Two more files used the `React.*` UMD global** than the audit found —
`app/components/LogoInverted.tsx` and `app/rrna/RrnaFilterSidebar.tsx`. Both already
import React explicitly (`import * as React` and `import React, { useMemo }`), so
neither is at risk and both were deliberately left alone.

## Phase 2 — React 19 and the dependency majors, on Next 15

Land Next **15** here, not 16. Next 15 still accepts synchronous `params` and
`headers()` behind a dev warning, so anything that breaks in this phase is
unambiguously a React or dependency problem rather than the async-API migration.

- [x] `npm install next@15 react@19 react-dom@19 @types/react@19 @types/react-dom@19 eslint-config-next@15 @next/third-parties@15`
- [x] `@headlessui/react` 1.7.19 → 2.2.10, 9 files. v2 is a rewrite, not a bump:
      - `Transition` — `app/components/ExportMenu/{ExportMenu,Button}.tsx`
      - `Dialog`, which no longer has `Dialog.Overlay` — `app/components/InfoModal.tsx`,
        `app/components/DatasetPickerOverlay.tsx`,
        `app/clinical-trials/visualise/ClinicalTrialsFilterSidebar.tsx`
      - `Tab` render props — `app/components/VisualisationCard.tsx`,
        `app/components/RrnaVisualisations/RrnaVisualisationCard.tsx`
      - `Switch` — `app/components/{Switch,DoubleLabelSwitch}.tsx`, lowest risk
- [x] `recharts` 2.12.7 → 3.10.1, 26 files. Most are stock `ResponsiveContainer` /
      `XAxis` / `Bar` / `Tooltip` and should need no change. The sharp edge is the
      `Sankey` in `app/components/RegionalFlowOfGrantsCard.tsx` — see Phase 0.
- [x] `react-select` 5.8.0 → 5.10.2, 7 files. Low risk: there are no
      `components={{ ... }}` overrides anywhere in the codebase, only the
      `MultiValue` / `SingleValue` / `ActionMeta` types.
- [x] `@react-spring/web` 9.7.3 → 10.1.2, 20 files but only five APIs in play
      (`animated`, `useInView`, `useReducedMotion`, `useSpring`, `useTransition`).
      Wide but shallow.
- [x] `next-seomatic` 0.1.5 → 0.1.7. One call site, `getMetadata` in
      `app/helpers/cms-page.ts`.
- [x] Three.js stack: `@react-three/fiber` 9.7.0, `@react-three/drei` 10.7.8,
      `three` and `@types/three` 0.185.x. The surface is one 49-line file,
      `app/components/RotatingGlobe.tsx`, mounted from `app/HomepageClient.tsx`.
      It also calls react-spring's `useReducedMotion`, so it is coupled to that bump.
- [x] Re-run the Phase 0 suite and compare against the baseline. **Do not start
      Phase 3 until it matches** — keeping these two failure modes apart is the
      whole reason for stopping at 15.

### What Phase 2 actually broke

27 type errors, in six clusters. Recorded because the shape of them is the useful
part — none was where the plan expected the risk to be.

| Cluster | Count | Fix |
| --- | --- | --- |
| `ElementType` props resolve to `never` in @types/react 19 | 3 | New shared `IconComponent` type in `app/helpers/types.ts`, replacing bare `ElementType` at 4 icon-prop sites |
| Recharts 3 widened mouse handlers to `SVGGraphicsElement` | 14 | Widened the six `MouseEvent<SVGPathElement>` annotations; all six handlers only read `clientX`/`clientY` |
| React 19 `useRef<T>(null)` is `RefObject<T \| null>` | 4 | Moved the null inside the RefObject on `TooltipContext` in `app/helpers/tooltip.ts` |
| Headless UI 2 render-prop bags | 3 | Migrated dot-notation to the v2 named components, and `MenuItem`'s `active` → `focus` |
| React 19 types `onInput` as `InputEventHandler` | 2 | Switched both controlled search inputs to `onChange`, which is the idiomatic React handler and also silences a latent controlled-input warning |
| Recharts 3 axis `tick` props | 1 | `RadiusAxisLabel` no longer receives `cx`/`cy` (it never used them) and `x`/`y` widened to `string \| number` |

**The async `params` migration had to move from Phase 3 to here.** Next 15 keeps
*runtime* compatibility with synchronous `params`, but its generated route types do
not — `next build` fails with `Type 'Parameters' is missing the following properties
from type 'Promise<any>'`. All six pages plus the two `next/headers` call sites were
migrated at this point rather than in Phase 3. `app/page.tsx` and
`app/grants/explore/page.tsx` had their unused `params` prop removed outright rather
than made async: neither route has a dynamic segment.

**Nothing in the Sankey needed changing.** The custom `SankeyNode` / `SankeyLink`
renderers — the single sharpest risk identified in planning, and invisible to `tsc`
because they are typed `props: any` — render correctly under Recharts 3. The
Phase 0 spec is what establishes that, and it is why the spec exists.

**Phase 2 verification, all matching the Phase 0 baseline:** 15/15 Playwright,
34/34 unit, `tsc` clean on both projects, `next build` succeeds, 0 lint errors.

**One process note.** npm could not resolve the new peer graph incrementally — it
kept reporting the installed `@react-three/drei@9` against the required `^10`.
`node_modules` and `package-lock.json` had to be removed and reinstalled from
scratch. Expect to do the same on any machine picking this branch up.

## Phase 3 — Next 16

- [x] `npm install next@latest @next/third-parties@latest eslint-config-next@latest`
- [x] Migrate the async request APIs. Run
      `npx @next/codemod@canary next-async-request-api .`, then check by hand.
      `npx next typegen` generates the `PageProps<'/grants/[id]'>` helpers, which
      make the rewritten signatures type-safe.

| File | What changes |
| --- | --- |
| `app/grants/[id]/page.tsx` | `params.id` in `generateMetadata` (~144, 157, 187) and `Page` (~212) |
| `app/clinical-trials/[id]/page.tsx` | same shape (~85, 100, 140) |
| `app/[...slug]/page.tsx` | `params.slug.join('/')` and `getPageContent(params)` |
| `app/preview/[...slug]/page.tsx` | `params`, plus the only page-prop `searchParams` in the repo |
| `app/page.tsx`, `app/grants/explore/page.tsx` | `params` is typed and destructured but never read — simplest fix is to drop the prop |
| `app/helpers/cms-page.ts` | `interface Parameters { slug: string[] }`, the shared type behind four of the above |
| `app/api/revalidate/route.ts` | `headers()` → `await headers()` |
| `app/api/preview/route.ts` | `draftMode()` → `await draftMode()` |

- [x] `revalidateTag('cms')` in `app/api/revalidate/route.ts` (~line 36) now needs
      a `cacheLife` profile — `revalidateTag('cms', 'max')`. The single-argument
      form is a TypeScript error in 16.
- [x] `app/layout.tsx` (~line 27) renders `<html lang="en" className="scroll-smooth">`.
      Next 16 no longer overrides `scroll-behavior` during navigation, so route
      changes would begin animating a smooth scroll to the top instead of jumping.
      Add `data-scroll-behavior="smooth"` to the same element to keep current
      behaviour.
- [x] `next lint` is removed. Run
      `npx @next/codemod@canary next-lint-to-eslint-cli .`, migrate `.eslintrc.json`
      (`extends: next/core-web-vitals` plus the `react/jsx-key` rule) to flat config
      on ESLint 9, and update all three call sites: the `lint` script in
      `package.json`, `.husky/pre-commit`, and the `npx next lint` step in the
      `unit_tests` job of `.gitlab-ci.yml`.
- [x] Turbopack becomes the default bundler for `next build`. There is no custom
      webpack config in this repo, so this should be uneventful. The one thing to
      watch is `app/api/og/route.tsx`, which resolves fonts and a background image
      with `new URL('/public/fonts/...', import.meta.url)` — a bundler-sensitive
      pattern. `next build --webpack` is the escape hatch if it misbehaves.
- [x] `next/image` defaults changed. Only one needs a decision:
      `images.minimumCacheTTL` moves from 60 seconds to 4 hours. Either accept it or
      pin `60` in `next.config.js`. The rest are no-ops here — `qualities` now
      defaults to `[75]` and no component passes a `quality` prop, `imageSizes`
      drops `16`, `maximumRedirects` caps at 3, and `remotePatterns` is already in
      use where the deprecated `images.domains` is not.

### What Phase 3 actually broke

**Turbopack rejected four server-relative imports**, which is the one thing the plan
predicted correctly. `app/api/og/route.tsx` loaded three fonts and a background via
`new URL("/public/...", import.meta.url)`, and three ContentBuilder files imported CSS
as `'/app/css/components/*.css'`. Webpack resolved both; Turbopack does not implement
server-relative imports at all. The CSS imports became relative; the OG assets are now
fetched over HTTP from the deployment, which is how that route already loaded its
grant JSON.

**The OG background then rendered blank, and that was not a bundler problem.** Satori
silently drops an absolutely-positioned `<img>` — as a data URI or as a URL, with `tw`
classes or with inline styles, the output was byte-identical every time. Moving the
image to a `backgroundImage` on the root element fixed it, and the local render now
matches production pixel for pixel. Worth knowing because the failure is invisible
from outside: the route returns HTTP 200 with a valid PNG, just a white one with white
title text on it.

**ESLint 9 brought 32 new errors, none of them regressions.** `eslint-config-next@16`
pulls in `eslint-plugin-react-hooks` 6, which ships `set-state-in-effect` (17),
`static-components` (7), `refs` (6) and `immutability` (2) as errors. All are
pre-existing patterns. They are set to `warn` in `eslint.config.mjs` so the lint gate
keeps its previous meaning — see the follow-ups, not a tick.

**Next 16 rewrote `tsconfig.json` itself** on the first build, moving
`moduleResolution` to `bundler` and `jsx` to `react-jsx`. `target` was then raised
from `es5` to `es2017` deliberately, since the Next 16 browser baseline is Chrome 111+.

**`images.minimumCacheTTL` is pinned to `60`** rather than taking the new 4-hour
default. CMS images are replaced at the same URL, so the new default would leave a
swapped image stale for hours.

## Phase 4 — pipeline and docs

- [x] Confirm `npx tsc --project tsconfig-scripts.json` still passes.
      `tsconfig-scripts.json` includes `app/api/helpers/search.ts`, whose first line
      is `import { NextResponse } from 'next/server'`, so the *scripts* build type-
      checks against Next's types. Every npm script (`generate`, `test`,
      `test:smoke`, `verify:artefacts`) starts with that `tsc`, and so do both deploy
      paths in `.gitlab-ci.yml` — a types regression here breaks deploys, not just
      the app build. If Next 16's types need a newer resolution than the current
      `moduleResolution: node`, lift the `NextResponse` usage out of the shared
      module rather than loosening the scripts tsconfig.
- [x] Consider `moduleResolution: node` → `bundler` and `target: es5` → `es2017` in
      `tsconfig.json`. Next 16's browser baseline is Chrome 111+, so `es5` output is
      dead weight. Optional — defer it if the diff is already large.
- [x] Update the README: the Technologies & Packages section, and add this doc to
      the Further Documentation table.
- [x] Decide what happens to this file once the migration lands — delete it, or
      rewrite it as a short reference.

`.nvmrc` (22) and `engines.node` (22.x) already clear Next 16's Node 20.9 minimum,
and `@playwright/test` is pinned to match the CI image tag. Neither needs touching.

## Verification at each phase

The Phase 0 suite is the backstop, re-run at the end of Phases 2 and 3 and compared
against the Phase 0 baseline. Around it:

1. `npm run generate` — needs OpenSearch (`docker compose up -d`, or the staging
   credentials from the GitLab CI/CD settings). Existing `data/dist` and
   `public/data` can be reused if present, since the app statically imports them.
2. `npm run lint` (full `tsc` plus ESLint) and `npm test`.
3. `npm run build`, then `npm start`.
4. `npm run test:e2e` against the local server, and
   `SMOKE_BASE_URL=http://localhost:3000 SKIP_DEPLOYMENT_WAIT=true npm run test:smoke`.
5. A short manual pass over what the specs only assert structurally — chart shapes,
   transition smoothness, globe motion. "Renders" and "renders correctly" are not
   the same claim, and no automated check here distinguishes them.
6. Push to a feature branch so the `deploy_review` → `vercel deploy` →
   `smoke_review` chain runs end to end before anything reaches `develop`.

## Do NOT re-flag: not applicable to this codebase

Checked against the Next 16 upgrade guide on 2026-09-04. Every one of these is a
documented Next 15 or 16 breaking change that this codebase does not hit, listed so
nobody spends time looking for them:

- **No `middleware.ts`** anywhere, so there is no `middleware` → `proxy` rename and
  no `skipMiddlewareUrlNormalize` flag to update. Redirects and rewrites are all in
  `next.config.js`.
- **No parallel routes**, so the new `default.js` requirement does not apply.
- **No AMP**, no `serverRuntimeConfig` / `publicRuntimeConfig`, no `devIndicators`
  options, no `experimental.ppr` / `dynamicIO` / `useCache` flags, no
  `unstable_rootParams`, and no `unstable_*` imports of any kind.
- **No `next/dynamic` and no `next/script`**, so neither the named-export transform
  nor `ssr: false` in a server component can bite.
- **No Server Actions**, no `'use server'`, no `useFormState` / `useFormStatus`.
- **No `forwardRef`, `defaultProps`, `PropTypes`, string refs, legacy context,
  class components, error boundaries, `ReactDOM.render` or bare `useRef()`** — the
  React 19 removals are all misses. There is also no global `JSX.Element` usage, so
  the `@types/react` 19 JSX-namespace change does not apply.
- **No `next/legacy/image`, no `images.domains`, no legacy `layout` / `objectFit`
  props and no custom image `loader`.** The only modern-API use is a single `fill`
  in `app/components/DatasetCard.tsx`.
- **No `legacyBehavior` or `passHref` on `next/link`.**
- `export const runtime = 'edge'` in `app/api/og/route.tsx` **is still supported**.
  Only `proxy` is barred from the edge runtime, and there is no proxy here.

## Final state

Verified on `feature/next-js-upgrade` against the Phase 0 baseline, with a local
`next build` and `next start`:

| Check | Baseline (Next 14 / React 18) | Now (Next 16.3.4 / React 19.2.8) |
| --- | --- | --- |
| `npx playwright test` | 15 passed | 15 passed |
| `npm test` | 34 passed | 34 passed |
| `npx tsc --noEmit` | clean | clean |
| `npx tsc --project tsconfig-scripts.json` | clean | clean |
| `npm run lint` | 0 errors, exit 0 | 0 errors, 37 warnings, exit 0 |
| `next build` | succeeds (webpack) | succeeds (Turbopack) |
| `/api/og` | renders | renders, pixel-matching production |

## Follow-ups

Deliberately left out of this upgrade:

- **32 `react-hooks` v6 findings**, currently warnings — 17 `set-state-in-effect`,
  7 `static-components`, 6 `refs`, 2 `immutability`. Several look like genuine
  anti-patterns rather than false positives. Working through them and restoring the
  rules to `error` is worthwhile follow-up work in its own right.
- **`@heroicons/react` is still v1**, four years EOL, across 70 files. Not a React 19
  blocker, which is why it was excluded. The v2 migration changes every import path,
  renames about a dozen icons in use, and alters outline stroke weight — a visual
  change needing a design pass.
- **`react-tooltip` 5, `swiper` 11 and `deck.gl` 9.0** are stale but install and run
  cleanly under React 19.
- **`images.minimumCacheTTL`** is pinned at the old 60s; the 4-hour default is worth
  considering on its own merits.
- **`@vercel/kv` is deprecated upstream** — the package now points at Upstash Redis
  through the Vercel Marketplace. Unrelated to this upgrade, but surfaced by its
  install warnings, and it backs the "share these filters" links.

## One decision left: `AGENTS.md` / `CLAUDE.md`

`next dev` on Next 16 generates `AGENTS.md` (pointing AI agents at the version-matched
docs bundled in `node_modules/next/dist/docs/`) and a one-line `CLAUDE.md` that
`@`-includes it. Both are currently untracked and not gitignored, and `next dev`
rewrites them on every run, so they will show up as untracked noise indefinitely until
someone decides. Three options, none of them automatic:

- **Commit them.** Next's own recommendation — a diff that keeps re-appearing is worse
  than a committed file, and it genuinely does help agents use the right docs.
- **Set `agentRules: false`** in `next.config.js` to stop Next generating them.
- **Gitignore them**, accepting that each developer gets their own local copy.

Left undecided deliberately: it is a repo convention question, not an upgrade one.

## Before merging

- [ ] Push the branch so GitLab's `deploy_review` → `vercel deploy` → `smoke_review`
      chain runs end to end. Everything above was verified locally; nothing has been
      exercised on Vercel yet.
- [ ] Confirm `/api/og` on the preview deployment, where `VERCEL_URL` is set and the
      assets come off the CDN rather than `localhost:3000`.
- [ ] Confirm the Vercel build picks up Next 16 and Turbopack without a project
      setting change — `vercel.json` sets no `buildCommand` or `framework`, so the
      build image autodetects the framework version.
- [ ] Run `npm ci` on a clean checkout. The lockfile was regenerated from scratch in
      Phase 2 and deserves one clean-install check before merge.
