import fs from 'fs-extra'
import _ from 'lodash'
import type {StringDictionary} from './types/Dictionary';

const data: Array<StringDictionary> = fs.readJsonSync('./data/download/data.json');

const dumpDir = './data/dump';

const headerToSnakeCaseHeaderMapping: {[index: string]: string} = fs.readJsonSync(`${dumpDir}/headers.json`);

const snakeCasedHeaders = Object.values(headerToSnakeCaseHeaderMapping);

const snakeCaseHeaderToOriginalHeaderMapping = _.invert(headerToSnakeCaseHeaderMapping);

snakeCasedHeaders.forEach(header => {
    const dataForThisHeader = data.map(item => item[header] ?? '');

    const sorted = dataForThisHeader.sort();

    const unique = Array.from(new Set(sorted));

    fs.writeJsonSync(
        `${dumpDir}/${header}.json`,
        dataForThisHeader,
        {spaces: 2}
    );

    fs.writeJsonSync(
        `${dumpDir}/${header}-sorted.json`,
        sorted,
        {spaces: 2}
    );

    fs.writeJsonSync(
        `${dumpDir}/${header}-unique.json`,
        unique,
        {spaces: 2}
    );

    const uniqueCommaSeparated = Array.from(new Set(unique.map(item => item.split(',')).flat(1)));

    fs.writeJsonSync(
        `${dumpDir}/${header}-unique-comma-separated.json`,
        uniqueCommaSeparated,
        {spaces: 2}
    );

    const uniqueSemicolonSeparated = Array.from(new Set(unique.map(item => item.split(';')).flat(1)));

    fs.writeJsonSync(
        `${dumpDir}/${header}-unique-semicolon-separated.json`,
        uniqueSemicolonSeparated,
        {spaces: 2}
    );

    const uniqueNewlineSeparated = Array.from(new Set(unique.map(item => item.split('\n')).flat(1)));

    fs.writeJsonSync(
        `${dumpDir}/${header}-unique-newline-separated.json`,
        uniqueNewlineSeparated,
        {spaces: 2}
    );

    const hasNewlines = dataForThisHeader.some(item => item.includes('\n'));

    const hasCommas = dataForThisHeader.some(item => item.includes(','));

    const hasSemicolons = dataForThisHeader.some(item => item.includes(';'));

    const hasBlanks = dataForThisHeader.some(item => item.trim() === '');

    const hasUnknown = dataForThisHeader.some(item => item.trim().match(/\bunknown\b/i));

    const hasNone = dataForThisHeader.some(item => item.trim().match(/\bnone\b/i));

    const hasNA = dataForThisHeader.some(item => item.trim().match(/\bn\/a\b/i));

    const smallestLength = dataForThisHeader.reduce((acc, item) => {
        const length = item.length;

        if (length < acc) {
            return length;
        }

        return acc;
    }, Infinity);

    const averageLength = dataForThisHeader.reduce(
        (acc, item) => acc + item.length,
        0,
    ) / dataForThisHeader.length;

    const biggestLength = dataForThisHeader.reduce((acc, item) => {
        const length = item.length;

        if (length > acc) {
            return length;
        }

        return acc;
    }, 0);

    console.log(`${snakeCaseHeaderToOriginalHeaderMapping[header]}`);
    console.log(`  snake case version: ${header}`);
    console.log(`  total items: ${dataForThisHeader.length}`);
    console.log(`  unique items: ${unique.length}`);
    console.log(`  unique comma separated items: ${uniqueCommaSeparated.length}`);
    console.log(`  unique semicolon separated items: ${uniqueSemicolonSeparated.length}`);
    console.log(`  unique newline separated items: ${uniqueNewlineSeparated.length}`);
    console.log(`  has newlines: ${hasNewlines}`);
    console.log(`  has commas: ${hasCommas}`);
    console.log(`  has semicolons: ${hasSemicolons}`);
    console.log(`  has blanks: ${hasBlanks}`);
    console.log(`  has unknown: ${hasUnknown}`);
    console.log(`  has none: ${hasNone}`);
    console.log(`  has n/a: ${hasNA}`);
    console.log(`  smallest length: ${smallestLength}`);
    console.log(`  average length: ${averageLength}`);
    console.log(`  biggest length: ${biggestLength}`);
    console.log('');
});
