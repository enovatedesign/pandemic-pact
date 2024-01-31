import dotenv from 'dotenv'

main()

async function main() {
    dotenv.config({path: './.env.local'})

    console.log('SEARCH_HOST', process.env.SEARCH_HOST)
    console.log('SEARCH_USERNAME', process.env.SEARCH_USERNAME)

    const basicAuth = Buffer.from(`${process.env.SEARCH_USERNAME}:${process.env.SEARCH_PASSWORD}`).toString('base64')

    const catHealthResponse = await fetch(
        `${process.env.SEARCH_HOST}/_cat/health`,
        {
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Basic ${basicAuth}`
            })
        }
    ).then(response => response.text())

    console.log('CAT', catHealthResponse);

    process.exit(1);
}
