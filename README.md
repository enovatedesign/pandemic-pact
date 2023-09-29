This project uses the following technologies and packages.

- [Next.js](https://nextjs.org/)
- [Vercel](https://vercel.com)
- [Typescript](https://www.typescriptlang.org/).
- [Meilisearch](https://www.meilisearch.com/)
- [Tremor](https://www.tremor.so/)
- [React Simple Maps](https://www.react-simple-maps.io/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)

## Getting Started

Start by ensuring that you are on the correct version of NodeJS by using NVM:

```bash
nvm use
```

### Meilisearch (optional)

The build should run successfully without Meilisearch, but the site relies on it heavily for search and export features so it is recommended. If you don't have it installed, you can get it with brew:

```bash
brew install meilisearch
```

I suggest starting it as a service so that it is always running in the background, even after rebooting your computer:

```bash
brew services start meilisearch
```

Finally, you will need to create an env file:

```bash
cp .env.local.example .env.local
```

The settings from `.env.local.example` should work automatically with the default settings brew meilisearch service.

# Generate Data

Next you will need to run our `generate` script which prepares the source data into a more suitable format, outputs it to the `/dist/data` directory and sends it to Meilisearch:

```bash
npm run generate
```

# Run the Development server

Now that you have generated the required data you can run the dev build:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
