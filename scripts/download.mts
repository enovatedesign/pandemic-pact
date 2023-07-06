import dotenv from 'dotenv'
import {GoogleSpreadsheet} from 'google-spreadsheet';
import fs from 'fs-extra';
import slugify from 'slugify'

import type {StringDictionary} from './types/Dictionaries';

main();

async function main() {
    dotenv.config({path: './.env.local'});

    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (typeof sheetId === 'undefined') {
        throw new Error('GOOGLE_SHEET_ID is not defined in .env.local');
    }

    const apiKey = process.env.GOOGLE_API_KEY;

    if (typeof apiKey === 'undefined') {
        throw new Error('GOOGLE_API_KEY is not defined in .env.local');
    }

    console.log(`Downloading data from Google Sheet ${sheetId}}`);

    const doc = new GoogleSpreadsheet(sheetId, {apiKey});

    await doc.loadInfo();

    const sheet = doc.sheetsByTitle['Funded Research Projects'];

    const rows = await sheet.getRows();

    const data = rows.map(row => row.toObject());

    const headers = Object.keys(data[0]);

    const snakeCasedHeaders: StringDictionary = {};

    headers.forEach(header => {
        snakeCasedHeaders[header] = slugify(header, {
            replacement: '_',
            lower: true,
            strict: true
        });
    });

    const dataWithSnakeCasedHeaders = data.map(row => {
        const rowWithSnakeCasedHeaders: StringDictionary = {};

        Object.keys(snakeCasedHeaders).forEach(header => {
            const snakeCasedHeader = snakeCasedHeaders[header];

            rowWithSnakeCasedHeaders[snakeCasedHeader] = row[header]
        });

        return rowWithSnakeCasedHeaders;
    });

    const dir = './data/download';

    await fs.ensureDir(dir);

    const dataPathname = `${dir}/data.json`;

    await fs.writeJson(dataPathname, dataWithSnakeCasedHeaders);

    console.log(`Raw data downloaded to ${dataPathname}`);

    // Dump mapping of headers to snake cased headers
    const dumpDir = './data/dump';

    fs.ensureDirSync(dumpDir);

    const headersPathname = `${dumpDir}/headers.json`;

    fs.writeJsonSync(headersPathname, snakeCasedHeaders);

    console.log(`Header map downloaded to ${headersPathname}`);
}
