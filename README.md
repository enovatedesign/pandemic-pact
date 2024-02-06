This project uses the following technologies and packages:

- [Next.js](https://nextjs.org)
- [Vercel](https://vercel.com)
- [Typescript](https://www.typescriptlang.org)
- [OpenSearch](https://opensearch.org)
- [Headless UI](https://headlessui.com)
- [Recharts](https://recharts.org)
- [React Simple Maps](https://www.react-simple-maps.io)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)

## Getting Started

Start by ensuring that you are on the correct version of NodeJS by using NVM:

```bash
nvm use
```

Install NPM dependencies:

```bash
npm install
```

### OpenSearch

The build should run successfully without OpenSearch, but the site relies on it heavily for the Grants Search, so it is recommended that you do set it up. There are two approaches:

#### Connect to the staging instance

The easiest way to get started is to set up an index on the staging instance. This is probably what you want unless you know you need a local docker instance.

Add the following to your `.env.local` file:

```
SEARCH_HOST="%%SEARCH_HOST%%"
SEARCH_USERNAME="%%SEARCH_USERNAME%%"
SEARCH_PASSWORD="%%SEARCH_PASSWORD%%"
SEARCH_INDEX_PREFIX="%%SEARCH_INDEX_PREFIX%%"
```

Replace `SEARCH_HOST`, `SEARCH_USERNAME` and `SEARCH_PASSWORD` with the corresponding values from [the CI/CD settings in Gitlab](https://gitlab.enovate.co.uk/clients/pandemic-pact/-/settings/ci_cd#js-cicd-variables-settings).

Replace `SEARCH_INDEX_PREFIX` with something unique so that you don't overwrite indexes of production/staging/other developers. For example mine is set to `"seb_dev"`.

### Generate Data

Next you will need to run our `generate` script which prepares the source data into a more suitable format, outputs it to the `/dist/data` directory and sends it to OpenSearch:

```bash
npm run generate
```

### Run the Development server

Now that you have generated the required data you can run the dev build:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
