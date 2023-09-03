import {useState} from 'react'
import {Button} from '@tremor/react'
import {DownloadIcon} from "@heroicons/react/outline"
import {meilisearchRequest} from "../helpers/meilisearch"
import exportToCsv from '../helpers/export-to-csv'

interface Props {
    meilisearchRequestBody: any
    filename: string
}

export default function ExportToCsvButton({meilisearchRequestBody, filename}: Props) {
    const [exportingCsv, setExportingCsv] = useState(false)

    const exportCsv = () => {
        setExportingCsv(true)

        meilisearchRequest('exports', meilisearchRequestBody).then(data => {
            exportToCsv(filename, data.hits)
            setExportingCsv(false)
        }).catch((error) => {
            console.error('Error:', error)
            setExportingCsv(false)
        })
    }

    return (
        <Button
            icon={DownloadIcon}
            loading={exportingCsv}
            disabled={exportingCsv}
            onClick={exportCsv}
        >
            Export Chart To CSV
        </Button >
    )
}
