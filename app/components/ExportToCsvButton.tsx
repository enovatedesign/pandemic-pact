import {useState} from 'react'
import Button from './Button'
import {meilisearchRequest} from "../helpers/meilisearch"
import {utils, writeFile} from 'xlsx'

interface Props {
    meilisearchRequestBody: any
    filename: string
    children?: React.ReactNode
}

export default function ExportToCsvButton({meilisearchRequestBody, filename}: Props) {
    const [exportingCsv, setExportingCsv] = useState(false)

    const exportCsv = () => {
        setExportingCsv(true)

        meilisearchRequest('exports', meilisearchRequestBody).then(data => {
            const worksheet = utils.json_to_sheet(data.hits)
            const workbook = utils.book_new()
            utils.book_append_sheet(workbook, worksheet, "Grants")
            writeFile(workbook, `${filename}.csv`, {bookType: 'csv'})

            setExportingCsv(false)
        }).catch((error) => {
            console.error('Error:', error)
            setExportingCsv(false)
        })
    }

    return (
        <Button
            loading={exportingCsv}
            disabled={exportingCsv}
            onClick={exportCsv}
            colour='secondary'
        >
            Export Chart Data (CSV)
        </Button >
    )
}
