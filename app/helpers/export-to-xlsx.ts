import {utils, writeFile} from 'xlsx'

export default async function exportToXlsx(filename: string, hits: any[]) {
    const worksheet = utils.json_to_sheet(hits)

    const workbook = utils.book_new()

    utils.book_append_sheet(workbook, worksheet, "Grants")

    writeFile(workbook, `${filename}.csv`, {bookType: 'csv'})
}
