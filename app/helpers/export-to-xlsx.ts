import * as XLSX from 'xlsx'

export default async function exportToXlsx(filename: string, hits: any[]) {
    const worksheet = XLSX.utils.json_to_sheet(hits)

    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, "Grants")

    XLSX.writeFile(workbook, `${filename}.csv`, {bookType: 'csv'})
}
