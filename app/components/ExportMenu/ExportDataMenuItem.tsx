import Button from "./Button"
import {useState} from 'react'
import {DownloadIcon} from '@heroicons/react/solid'
import {meilisearchRequest} from "../..//helpers/meilisearch"
import {utils, writeFile} from 'xlsx'

interface Props {
    dataFilename: string,
    meilisearchRequestBody: any,
}

export default function ExportDataMenuItem({dataFilename, meilisearchRequestBody}: Props) {
    const [exportingCsv, setExportingCsv] = useState(false)

    const exportCsv = () => {
        if (exportingCsv) {
            return
        }

        setExportingCsv(true)

        meilisearchRequest('exports', meilisearchRequestBody).then(data => {
            const worksheet = utils.json_to_sheet(data.hits)
            const workbook = utils.book_new()
            utils.book_append_sheet(workbook, worksheet, "Grants")
            writeFile(workbook, `${dataFilename}.csv`, {bookType: 'csv'})

            setExportingCsv(false)
        }).catch((error) => {
            console.error('Error:', error)
            setExportingCsv(false)
        })
    }

    return (
        <Button
            Icon={DownloadIcon}
            label="Export Chart Data (CSV)"
            onClick={exportCsv}
            loading={exportingCsv}
            className="rounded-b-md"
        />
    )
}
