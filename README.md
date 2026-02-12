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

## Vercel Blob Storage Caching

This project uses [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob) to cache and serve generated data assets (such as grants, select options, and research category mappings) for each branch. This enables faster builds and consistent data access across environments.

### How it works
- When you run the data generation script (`npm run generate`), the build will check if the source data has changed.
- If the data has changed, the generated assets are uploaded to Vercel Blob Storage under a path for your current branch.
- If the data has not changed, the build will fetch and use the cached assets from Blob Storage for your branch.

### Controlling Blob Uploads
- The environment variable `FORCE_BLOB_UPLOAD` controls whether assets are uploaded to Blob Storage.
	- **For local development:** Set `FORCE_BLOB_UPLOAD=false` (default). This prevents unnecessary uploads and uses local files.
	- **For deployment or sharing assets:** Set `FORCE_BLOB_UPLOAD=true` to force the upload of generated assets for your current branch. This is useful if you want your branch's data to be available to others or to Vercel deployments.

You can set this in your `.env.local`:
```
FORCE_BLOB_UPLOAD=false
```
or
```
FORCE_BLOB_UPLOAD=true
```

**Note:** Blob uploads require the `BLOB_READ_WRITE_TOKEN` and `BLOB_BASE_URL` environment variables to be set (see Vercel project settings).

## Environment Variables

This project uses several environment variables. See `.env.local.example` for a template. Here is a summary:

| Variable | Purpose | Where to find |
| --- | --- | --- |
| `SEARCH_HOST` | OpenSearch host URL | GitLab CI/CD settings |
| `SEARCH_USERNAME` | OpenSearch username | GitLab CI/CD settings |
| `SEARCH_PASSWORD` | OpenSearch password | GitLab CI/CD settings |
| `SEARCH_INDEX_PREFIX` | Unique prefix for your indexes | Choose your own |
| `FORCE_BLOB_UPLOAD` | Control blob upload behaviour | Set in `.env.local` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob auth | Vercel project settings |
| `BLOB_BASE_URL` | Vercel Blob base URL | Vercel project settings |

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

If you want to upload the generated data to Vercel Blob Storage for your branch, set `FORCE_BLOB_UPLOAD=true` in `.env.local` before running the `npm run generate` command.

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

## DOI

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.18622168.svg)](https://doi.org/10.5281/zenodo.18622168)

## License

This project is licensed under the MIT License. See [LICENSE.md](LICENSE.md) for details.
