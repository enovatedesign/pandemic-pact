# Decoupled build & deploy (GitLab generates, Vercel deploys)

**Status: live on all branches since 2026-07-06.** Reference for how deploys work
now — not a plan.

## What it does
The heavy data generation (`npm run generate`) runs on the **GitLab runner**, not
on Vercel. Vercel only ever does the lightweight **cached restore + `next build`**
(~3 min). The full ~10-min generation never runs on Vercel for any branch.

Why: a full generate is ~10 min on GitLab vs ~19 min on Vercel (`prepareGrants` is
~2× faster there), and it drops every Vercel build to the cached path — removing
the 45-min build-ceiling risk and cutting Vercel build cost/time.

## How it works
1. **Vercel Git auto-deploy is off** — `vercel.json` sets
   `git.deploymentEnabled: false` globally. (Only `develop` + `master` mirror to
   GitHub; feature branches are GitLab-only.) Production/staging deploy **only** via
   Deploy Hook; feature previews via the Vercel CLI. Both bypass `deploymentEnabled`.
2. On a push, a GitLab job runs the **freshness gate**
   (`scripts/check-grants-freshness.ts`): compares the committed
   `FIGSHARE_GRANTS_FILE_ID` against the branch's S3 marker.
   - **Data changed** → `FORCE_UPLOAD=true npm run generate` on the runner (writes
     the branch S3 prefix + OpenSearch index + marker), then triggers the deploy.
   - **Unchanged** (code-only) → skip generate, go straight to the deploy.
3. **Deploy**: `develop`/`master` `POST` their Vercel Deploy Hook; feature branches
   run `vercel deploy` (CLI). By the time Vercel builds, the marker matches → it
   takes the cached path.

### Jobs (`.gitlab-ci.yml`)
| Job | Branch(es) | Deploy mechanism | Trigger |
|---|---|---|---|
| `deploy_review` | feature (not develop/master) | `vercel deploy` CLI | automatic |
| `deploy_develop` | develop | `VERCEL_DEVELOP_DEPLOY_HOOK` | automatic |
| `deploy_production` | master | `VERCEL_PRODUCTION_DEPLOY_HOOK` | automatic |

`deploy_develop` + `deploy_production` share the `.deploy_decoupled` template. The
weekly `fetch_pubmed_data` job is unchanged.

### `.vercelignore` (required for feature-branch deploys)
Because `deploy_review` runs `npm run generate` on the runner **before**
`vercel deploy`, the working directory fills with generated artefacts —
`data/download/grants.json` alone is ~1.1 GB. Without excluding them, `vercel
deploy` uploads all of it as deployment source and hits Vercel's **1 GB upload
limit**. `.vercelignore` therefore excludes the runner-generated output
(`data/download/`, `data/dist/`, `public/data/`, `public/export/`,
`public/grants/`, `public/clinical-trials/`); Vercel regenerates/restores it all during its own cached build,
so the upload is just the repo source (~1 MB). This only bites when the freshness
gate actually runs a full generate (fresh feature branch or a feature-branch data
change) — hook-based develop/master deploys never upload the working dir.

## Per-environment targets (the correctness-critical bit)
The S3 prefix derives from the branch automatically; the OpenSearch index comes
from env vars and is **not** the same as the branch for develop.

| Env | S3 prefix | OpenSearch index | `SEARCH_INDEX_PREFIX` |
|---|---|---|---|
| master / production | `master/` | `grants-v2` | *(empty)* |
| develop | `develop/` | `staging-grants-v2` | `staging` |
| feature | `<branch>/` | `<branch>-grants-v2` | `$CI_COMMIT_REF_NAME` |

- `SEARCH_INDEX_VERSION=v2` is a GitLab CI/CD variable (also used by the weekly
  PubMed job).
- The deploy jobs set `SEARCH_INDEX_PREFIX` **inline** on the `npm run generate`
  command so it always wins over any ambient variable. **develop's prefix is
  `staging`, not `develop`** — matching what its Vercel deployment reads.

## Forcing a full rebuild without a data change
Set `FORCE_FULL_GENERATE=true` (must be exactly `true`) to force a full generate
even when the file ID is unchanged — e.g. after changing generate *logic*.
Honoured by both the freshness gate and `download-and-parse-data-sheets.ts`.
- Set it as an **All-scoped** GitLab CI/CD variable so it reaches the
  environment-scoped deploy jobs.
- **No branch guard**: while it's `true`, *every* deploy (incl. production) does a
  full generate. Set it back to `false` after the run you wanted.

## Safety properties
- **Marker written last** in generate → a mid-generate failure leaves the marker
  stale, fails the job, and the deploy hook isn't fired — the branch stays on its
  current deploy.
- **Freshness gate is non-load-bearing** → if it's ever wrong, the hook-triggered
  Vercel build sees a marker mismatch and does a correct full build itself (slow
  that once).
- **Failed pipeline = no deploy.** Transient `npm ci` / network failures fail safe.
- **No new prod-data exposure** — GitLab writing the branch S3 prefix mid-generate
  is the same live-read exposure Vercel's build already had (grant pages read S3 at
  `ASSET_BASE_URL` at runtime).

## Known follow-ups
- **`retry: 2`** on the deploy jobs — auto-ride transient `npm ci` ECONNRESET
  (the weekly job already has it; the deploy jobs don't yet).
- **Dedup the two `uploadStaticFiles` passes** (~57 s of redundant re-upload) —
  see [`generate-performance.md`](./generate-performance.md#remaining-follow-up).

`prepareGrants` speed-up is **done** — single-pass extraction cut it ~5.4 min →
~67 s (see `generate-performance.md`).
