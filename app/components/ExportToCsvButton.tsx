import {useState} from 'react'
import {Button} from '@tremor/react'
import {TableIcon} from "@heroicons/react/solid"
import meilisearchRequest from '../helpers/meilisearch-request'
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
            icon={TableIcon}
            loading={exportingCsv}
            disabled={exportingCsv}
            onClick={exportCsv}
        >
            Export Chart To PNG
        </Button >
    )
}
