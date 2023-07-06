import fs from 'fs-extra'
import dayjs from 'dayjs'
import type {Dictionary, StringDictionary} from './types/Dictionaries'

type SanitisedValue = string | string[] | number;

type SanitisedRow = Dictionary<SanitisedValue>;

const rawDataPathname = './data/download/data.json';

console.log(`Sanitising data from ${rawDataPathname}`);

const data: Array<StringDictionary> = fs.readJsonSync(rawDataPathname);

const headers = Object.keys(data[0]);

const sanitisedData = data.map(row => {
    const sanitisedRow: SanitisedRow = {};

    headers.forEach(header => {
        let value: SanitisedValue = (row[header] ?? '').trim();

        switch (header) {
            case 'amount_awarded':
            case 'amount_awarded_converted_to_usd':
                value = sanitizeMonetaryValue(value);
                break;

            case 'start_date':
            case 'end_date':
                value = sanitiseDateValue(value);
                break;

            case 'country_countries_research_is_being_are_conducted':
                value = sanitiseCommaSeparateValues(value);
                break;
        }

        sanitisedRow[header] = value;
    });

    return sanitisedRow;
});

const distDir = './data/dist';

fs.ensureDirSync(distDir);

const sanitisedDataPathname = `${distDir}/data.json`;

fs.writeJsonSync(sanitisedDataPathname, sanitisedData);

console.log(`Sanitised data written to ${sanitisedDataPathname}`);

function sanitizeMonetaryValue(value: string): string {
    // Remove any non-numeric characters (e.g. commas, currency symbols) except for the decimal point
    const v = value.replace(/[^\d.]/g, '');

    if (isNaN(+v)) {
        return '';
    }

    return v;
}

function sanitiseDateValue(value: string): string {
    const d = dayjs(value);

    if (!d.isValid()) {
        return '';
    }

    return d.format('YYYY-MM-DD');
}

function sanitiseCommaSeparateValues(value: string): string[] {
    return value.split(',').map(
        item => item.trim()
    ).filter(
        item => item !== ''
    );
}
