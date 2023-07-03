import fs from 'fs-extra'
import slugify from 'slugify'
import dayjs from 'dayjs'
import type {Dictionary} from './types/Dictionary'

const data: Array<Dictionary> = fs.readJsonSync('./data/download/data.json');

const headers = Object.keys(data[0]);

const sanitisedData = data.map(row => {
    const sanitisedRow: Dictionary = {};

    headers.forEach(header => {
        let value = (row[header] ?? '').trim();

        switch (header) {
            case 'amount_awarded':
            case 'amount_awarded_converted_to_usd':
                value = sanitizeMonetaryValue(value);
                break;

            case 'start_date':
            case 'end_date':
                value = sanitiseDateValue(value);
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
