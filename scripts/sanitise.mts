import fs from 'fs-extra'
import dayjs from 'dayjs'
import type {Dictionary, StringDictionary} from './types/Dictionaries'

type SanitisedValue = string | string[] | number;

type SanitisedData = Dictionary<SanitisedValue>;

const data: Array<StringDictionary> = fs.readJsonSync('./data/download/data.json');

const headers = Object.keys(data[0]);

const sanitisedData = data.map(row => {
    const sanitisedRow: SanitisedData = {};

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

fs.ensureDirSync('./data/dist');

fs.writeJsonSync('./data/dist/data.json', sanitisedData);

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
