import dotenv from 'dotenv'
import prepareSearch from './scripts/generate/prepare-search.mjs'

main()

async function main() {
    dotenv.config({path: './.env.local'})
    await prepareSearch()
}
