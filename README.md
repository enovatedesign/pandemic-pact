# Pandemic PACT

## About

Pandemic PACT tracks and analyses global funding and evidence for research on diseases with pandemic potential and broader preparedness efforts, ready to pivot in response to outbreaks.

http://www.pandemicpact.org/

## Technologies & Packages

This project uses the following technologies and packages:

-   [Next.js](https://nextjs.org)
-   [Vercel](https://vercel.com)
-   [Typescript](https://www.typescriptlang.org)
-   [OpenSearch](https://opensearch.org)
-   [Tailwind CSS](https://tailwindcss.com)
-   [Headless UI](https://headlessui.com)
-   [Recharts](https://recharts.org)
-   [deck.gl](https://deck.gl)
-   [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
-   [GSAP](https://gsap.com)
-   [Playwright](https://playwright.dev)

## S3 Data Storage & Caching

This project uses Amazon S3 (served via CloudFront) to cache and serve generated data assets (such as grants, select options, and research category mappings) for each branch. This enables faster builds and consistent data access across environments. See [`docs/decoupled-build.md`](docs/decoupled-build.md) for how the per-branch prefixes and the freshness marker fit into the deploy pipeline.

### How it works
- When you run the data generation script (`npm run generate`), the build will check if the source data has changed.
- If the data has changed, the generated assets are uploaded to S3 under a path for your current branch.
- If the data has not changed, the build will fetch and use the cached assets from S3 for your branch.

### Controlling uploads
- The environment variable `FORCE_UPLOAD` controls whether assets are uploaded to S3.
	- **For local development:** Set `FORCE_UPLOAD=false` (default). This prevents unnecessary uploads and uses local files.
	- **For deployment or sharing assets:** Set `FORCE_UPLOAD=true` to force the upload of generated assets for your current branch. This is useful if you want your branch's data to be available to others or to Vercel deployments.

You can set this in your `.env.local`:
```
FORCE_UPLOAD=false
```
or
```
FORCE_UPLOAD=true
```

**Note:** uploads require the AWS credentials plus `S3_BUCKET`, `ASSET_BASE_URL`, and `CLOUDFRONT_DISTRIBUTION_ID` — see the Vercel project settings and the GitLab CI/CD variables for the current values.

## PubMed Data Fetching

The generate script fetches publication data from PubMed (via the Europe PMC API). PubMed data is stored as **standalone files** (`pubmed/{PubMedGrantId}.json`) in S3, separate from the main grant data. This means PubMed data can be refreshed independently without re-generating all ~28k individual grant files.

### How it works

- Each grant's PubMed data is tracked with a per-grant `lastChecked` timestamp stored in S3.
- Grants checked within the last **7 days** are considered fresh and skip API calls.
- If all grants are fresh, the fetch completes almost instantly using cached data.
- Stale grants are fetched from the PubMed API individually, with checkpoints saved every 100 grants.
- Each freshly-fetched grant's publications are **uploaded to S3 immediately** (`pubmed/{PubMedGrantId}.json`), so partial results are live even if the build times out.
- A **circuit breaker** stops fetching after 20 consecutive API failures to avoid blocking deployments.
- When running during a cached build (FigShare data unchanged), a **timeout of 8 minutes** is enforced. Any grants not fetched within this window fall back to cached data (if available within a 45-day grace period) or are marked as unavailable.
- Grant detail pages load PubMed data on-demand from the standalone files, not from the main grant JSON.

### Controlling PubMed fetching

| Variable | Purpose |
| --- | --- |
| `SKIP_FETCHING_PUBMED_DATA` | Skip PubMed fetch entirely (useful for local dev) |
| `FETCH_PUBMED_DATA` | Force re-fetch all grants regardless of freshness |
| `PUBMED_JSON_AUDIT` | Audit and repair the individual PubMed object files during the fetch |

## Environment Variables

`.env.local.example` is the template and the fuller reference — copy it to `.env.local` and fill in the blanks. This table summarises what each variable is for and where its value comes from.

| Variable | Purpose | Where to find |
| --- | --- | --- |
| `SEARCH_HOST` | OpenSearch host URL | GitLab CI/CD settings |
| `SEARCH_USERNAME` | OpenSearch username | GitLab CI/CD settings |
| `SEARCH_PASSWORD` | OpenSearch password | GitLab CI/CD settings |
| `SEARCH_INDEX_PREFIX` | Unique prefix for your indexes | Choose your own |
| `SEARCH_INDEX_VERSION` | Version suffix on the index name (`v2` → `grants-v2`), for building a parallel index before promoting it | GitLab CI/CD settings |
| `SKIP_OPENSEARCH_INDEXING` | Skip indexing during `npm run generate` | Set in `.env.local` |
| `FORCE_UPLOAD` | Force upload of generated assets to S3 | Set in `.env.local` |
| `FORCE_FULL_GENERATE` | Force a full generate even when the source data is unchanged | Set in `.env.local`, or as an All-scoped GitLab CI/CD variable |
| `USE_REMOTE_STORAGE` | Read data from the CDN vs local `public/` files | Set in `.env.local` |
| `S3_BUCKET` / `ASSET_BASE_URL` / `CLOUDFRONT_DISTRIBUTION_ID` | S3 + CloudFront config | Vercel project settings |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | S3 write credentials | Vercel / GitLab CI/CD settings |
| `AWS_REGION` | Region for the S3 bucket and CloudFront calls | `.env.local.example` has the current value |
| `FIGSHARE_PA_TOKEN` | Downloads the source datasets. **`npm run generate` throws without it**, and clinical-trials generation self-skips | GitLab CI/CD settings |
| `CONTENT_API_URL` / `CONTENT_API_TOKEN` | Craft CMS GraphQL API, which supplies the page content | GitLab CI/CD settings |
| `REVALIDATE_API_TOKEN` | Authenticates the CMS revalidation webhook | GitLab CI/CD settings |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Vercel KV, which backs the "share these filters" links | Vercel project settings |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager container | Vercel project settings |
| `SMOKE_BASE_URL` | Deployment the smoke checks and browser tests run against | Set per job in `.gitlab-ci.yml` |
| `SKIP_DEPLOYMENT_WAIT` | Skip waiting for a new build before smoke testing | Set for feature branches / local runs |
| `SKIP_ARTEFACT_VERIFICATION` | Skip the post-generate artefact checks | Set in `.env.local` when a dataset was intentionally not built |

The PubMed fetch has three switches of its own — `SKIP_FETCHING_PUBMED_DATA`, `FETCH_PUBMED_DATA` and `PUBMED_JSON_AUDIT`; see [PubMed Data Fetching](#pubmed-data-fetching) above.

Every on/off variable above is compared strictly against the string `true`, so setting one to `false` disables it. No value other than `true` switches anything on.

## Getting Started

Start by ensuring that you are on the correct version of NodeJS by using NVM:

```bash
nvm use
```

Next, install dependencies:

```bash
npm ci
```

### OpenSearch

The build should run successfully without OpenSearch, but the site relies on it heavily for the Grants Search, so it is recommended that you do set it up. There are two approaches:

#### 1. Connect to the staging instance

The easiest way to get started is to set up an index on the staging instance.

Add the following to your `.env.local` file:

```
SEARCH_HOST="%%SEARCH_HOST%%"
SEARCH_USERNAME="%%SEARCH_USERNAME%%"
SEARCH_PASSWORD="%%SEARCH_PASSWORD%%"
SEARCH_INDEX_PREFIX="%%SEARCH_INDEX_PREFIX%%"
```

Replace `%%SEARCH_HOST%%`, `%%SEARCH_USERNAME%%` and `%%SEARCH_PASSWORD%%` with the corresponding values from [the CI/CD settings in Gitlab](https://gitlab.enovate.co.uk/clients/pandemic-pact/-/settings/ci_cd#js-cicd-variables-settings).

Replace `%%SEARCH_INDEX_PREFIX%%` with something unique so that you don't overwrite indexes of production/staging/other developers. For example mine is set to `"seb_dev"`.

#### 2. Run OpenSearch locally using docker

If you want to run OpenSearch locally, you can use docker. Note that it is probably easier to use the Staging instance as documented above, unless you are specifically working on OpenSearch-related code (such as the `generate` script or search API routes).

I recommend familiarising yourself with the [OpenSearch Quickstart](https://opensearch.org/docs/latest/quickstart/) documentation first.

Running the following command should automatically pull and start the OpenSearch containers, assuming you have Docker installed:

```bash
docker compose up -d
```

You should see the following output (it might take a while if this is the first time):

```
[+] Running 3/3
 ✔ Container opensearch-dashboards Started         0.9s
 ✔ Container opensearch-node2      Started         1.0s
 ✔ Container opensearch-node1      Started         1.0s
```

You can use the following `.env.local` variables to connect to the local OpenSearch instance:

```
SEARCH_HOST="https://localhost:9200"
SEARCH_USERNAME="admin"
SEARCH_PASSWORD="admin"
NODE_TLS_REJECT_UNAUTHORIZED=0
```

Note that I had to use `https://` protocol, otherwise I had errors when trying to index. Thus I also needed to use `NODE_TLS_REJECT_UNAUTHORIZED=0`.

Now when you run `npm run generate` it should create a search index in your local OpenSearch instance and populate it with grant data.

One benefit of running OpenSearch in this way is that [OpenSearch Dashboard](https://opensearch.org/docs/latest/dashboards/quickstart/) is also set up and can be accessed in the browser via `http://localhost:5601`. This can be useful for debugging.

### Generate Data

Next you will need to run our `generate` script which prepares the source data into a more suitable format, outputs it to the `data/dist` directory and sends it to OpenSearch:

```bash
npm run generate
```

If you want to upload the generated data to S3 for your branch, set `FORCE_UPLOAD=true` in `.env.local` before running the `npm run generate` command.

#### Forcing a full generate

Both the pipeline and the CI freshness gate decide between a full generate and the
fast cached path by comparing the committed `FIGSHARE_GRANTS_FILE_ID` against the S3
marker for the branch. A code-only change therefore takes the cached path, which is
usually what you want — but not when you have changed the generate *logic* itself and
need the output rebuilt from source.

`FORCE_FULL_GENERATE=true` (the string must be exactly `true`) bypasses that gate.
It is honoured in both places that make the decision — `scripts/check-grants-freshness.ts`
and `scripts/generate/download-and-parse-data-sheets.ts` — so setting it once covers the
whole run.

```
FORCE_FULL_GENERATE=true
```

In CI, set it as an **All-scoped** GitLab variable so it reaches the environment-scoped
deploy jobs.

> **There is no branch guard.** While it is `true`, *every* deploy does a full generate,
> production included. Set it back to `false` once the run you wanted has finished.

See [`docs/decoupled-build.md`](docs/decoupled-build.md) for how the freshness gate fits
into the deploy pipeline.

### Run the Development server

Now that you have generated the required data you can run the dev build:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Type-checking and Linting

When `npm run build` is executed to prepare the production build, the TypeScript compiler and NextJS linter are also run, to catch mistakes at build-time if possible. However, the full build can take a number of minutes, so if you are trying to fix an error or warning emitted by one of these tools it can be useful to run them separately, without having to wait for `npm run build` to run.

You can run both of them at once:

```bash
npm run lint
```

If, for some reason, you need to run the TypeScript compiler _without_ running the NextJS linter:

```bash
npx tsc
```

The TypeScript compiler will print **no output** if there are no errors.

To run the NextJS Linter _without_ running the TypeScript compiler:

```bash
npx next lint
```

Unlike the TypeScript compiler, the linter will print a success message if there are no issues:

```
✔ No ESLint warnings or errors
```

A husky pre-commit hook runs `npm run lint` before each commit. Its whole-app `tsc` needs the generated data to be present, since the app statically imports JSON from `data/dist` and `public/data` — which is why CI runs `next lint` on its own in the `test` stage and leaves that typecheck to Vercel's `next build`, where the data exists.

## Testing

The suite exists to catch the failures this project actually has: pages that return HTTP 200 while showing nothing real. A missing export CSV fails only on click, a dashboard whose dataset never loaded renders plausible-looking fallback charts, and a 503 from the search API is parsed as if it were results. None of that shows up in a build log, so it is checked in four layers.

| Layer | Command | Runs |
| --- | --- | --- |
| Unit tests | `npm test` | GitLab `test` stage — gates every deploy |
| Build artefact verification | `npm run verify:artefacts` | Automatically at the end of `npm run generate` |
| HTTP smoke checks | `npm run test:smoke` | GitLab `verify` stage, after each deploy |
| Browser tests | `npm run test:e2e` | GitLab `verify` stage, after each deploy |

### Unit tests

```bash
npm test
```

Node's built-in test runner (`node --test`) over `scripts/tests/`, covering the pure logic where a silent wrong answer is most expensive:

-   `search-query.test.ts` — the OpenSearch boolean query builder.
-   `csv-filter.test.ts` — `filterCsv()`, which underpins every filtered export and matches on the raw first column.
-   `helpers.test.ts` — `normaliseBranchName()` (shared by the indexer and the app; a mismatch reads as "no data") and `resolveTrendStartYear()`.

Tests run against the compiled output, so anything under test must be reachable from `tsconfig-scripts.json`'s `include` — that is why a couple of `app/` helpers are listed there alongside `scripts/`.

### Build artefact verification

```bash
npm run verify:artefacts
```

`scripts/verify-build-artefacts.ts` asserts that the files the frontend fetches at runtime actually exist, are the right shape and are not suspiciously small — row and record counts, byte ceilings, and the id-in-column-one invariant that `filterCsv()` depends on. It runs at the end of `npm run generate`, so it covers the cached and full build paths alike and aborts `next build` before a deployment can ship without them.

It also writes `public/data/build-manifest.json` (commit SHA, branch, generation time, record counts), which the smoke checks use to identify the live build.

Set `SKIP_ARTEFACT_VERIFICATION=true` locally if you deliberately generated without a dataset.

### HTTP smoke checks

```bash
SMOKE_BASE_URL=https://pandemic-pact.vercel.app SKIP_DEPLOYMENT_WAIT=true npm run test:smoke
```

`scripts/smoke-test.ts` runs against a deployed URL and is deliberately HTTP-only and fast: export CSVs (fetched with a `Range` header, since the grants export is >100 MB), dataset volumes from the manifest, the search API, key pages and redirects, and a sample of detail pages.

`develop` and `master` deploy asynchronously via a Vercel deploy hook, so by default the script first polls `build-manifest.json` until the build for this commit is live (`scripts/wait-for-deployment.ts`, 12-minute timeout). Set `SKIP_DEPLOYMENT_WAIT=true` when the URL is already known to be current — feature-branch previews, and any local run.

### Browser tests

```bash
npx playwright install chromium   # first run only
npm run test:e2e
```

`tests/e2e/` covers what only a browser can see. `visualise.spec.ts` is the highest-value spec: it asserts each dashboard resolves its dataset and renders real records rather than the fallback data in `app/components/NoData/`. `explore.spec.ts` covers the two OpenSearch-backed pages, and `export.spec.ts` drives a real export download through the UI.

Uncaught page exceptions fail a test — the app has no `error.tsx`, so one leaves a broken page behind a 200. Console errors are collected into the report but not asserted on, as third-party tags make them too noisy to gate a deploy.

Notes:

-   `SMOKE_BASE_URL` defaults to `http://localhost:3000`, so a local `npm run dev` needs no env var.
-   `@playwright/test` is pinned without a caret because the CI job uses the matching `mcr.microsoft.com/playwright` image, which ships only its own browser build.
-   Chromium is launched with SwiftShader; the visualise pages, RRNA and the homepage render WebGL and fail in headless CI without a software rasteriser.

### How CI wires this together

`.gitlab-ci.yml` runs `next lint` and `npm test` in the `test` stage, which gates the deploy jobs. The `verify` stage then runs `npm run test:smoke` and `npm run test:e2e` against the deployment — the same commands documented above, so CI and a local run cannot drift apart. Those post-deploy checks cannot gate an async deploy hook, but a failure fails the pipeline, which is the alert.

## Further Documentation

| Doc | Covers |
| --- | --- |
| [`docs/decoupled-build.md`](docs/decoupled-build.md) | How deploys actually work: GitLab runs the heavy generate, Vercel only ever takes the cached path. Per-environment S3 prefixes and OpenSearch indexes, the freshness gate, and the safety properties that make it fail closed. |
| [`docs/generate-performance.md`](docs/generate-performance.md) | Constraints to preserve when changing `npm run generate` — why `extractCheckboxAndPrefixFields` is single-pass, why its slower predecessors are deliberately kept, and the byte-parity check any generate change must pass. |
| [`docs/clinical-trials-follow-ups.md`](docs/clinical-trials-follow-ups.md) | Deferred structural and efficiency items from the Clinical Trials review. None is a live bug. |

Open follow-ups live next to the thing they concern, not in a central backlog: build-pipeline items under **Known follow-ups** in `decoupled-build.md` and **Remaining follow-up** in `generate-performance.md`, and the app-level ones in `clinical-trials-follow-ups.md`. Each is stated once, in the doc that explains the mechanism behind it.

## DOI

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.18622168.svg)](https://doi.org/10.5281/zenodo.18622168)

## License

This project is licensed under the MIT License. See [LICENSE.md](LICENSE.md) for details.
