import fs from 'fs-extra'
import slugify from 'slugify'
import dayjs from 'dayjs'

const data = fs.readJsonSync('./data/download/data.json');

const headers = Object.keys(data[0]);

const sanitisedData = data.map(row => {
    const sanitisedRow = {};

    headers.forEach(header => {

        let value = (row[header] ?? '').trim(); 

        if (eval(`typeof sanitise_${header} === 'function'`)) {
            value = eval(`sanitise_${header}(value)`);
        }

        sanitisedRow[header] = value;
    });

    return sanitisedRow;
});

fs.ensureDirSync('./data/dist');

fs.writeJsonSync('./data/dist/data.json', sanitisedData);

function sanitise_amount_awarded(value) {
    return sanitizeMonetaryValue(value);
}

function sanitise_amount_awarded_converted_to_usd(value) {
    return sanitizeMonetaryValue(value);
}

function sanitise_start_date(value) {
    return sanitiseDateValue(value);
}

function sanitise_end_date(value) {
    return sanitiseDateValue(value);
}

function sanitizeMonetaryValue(value) {
    // Remove any non-numeric characters (e.g. commas, currency symbols) except for the decimal point
    const v = value.replace(/[^\d.]/g, '');

    if (isNaN(v)) {
        return '';
    }

    return v;
}

function sanitiseDateValue(value) {
    const d = dayjs(value);

    if (!d.isValid()) {
        return '';
    }

    return d.format('YYYY-MM-DD');
}
