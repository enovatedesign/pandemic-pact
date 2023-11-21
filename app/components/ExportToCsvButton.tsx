import {useState} from 'react'
import Button from './Button'
import {meilisearchRequest} from "../helpers/meilisearch"
import {utils, writeFile} from 'xlsx'
import { propagateServerField } from 'next/dist/server/lib/render-server'
import { CloudDownloadIcon } from '@heroicons/react/outline'

interface Props {
    meilisearchRequestBody: any
    filename: string
    children?: React.ReactNode
    title: string
    props?: any
    size?: string
}

export default function ExportToCsvButton({meilisearchRequestBody, filename, title, ...props}: Props) {
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
            colour="grey"
            customClasses="flex items-center justify-center self-start gap-2"
            {...props}
        >
            <span>Download Data</span>
            <CloudDownloadIcon className="w-5 h-5"/>
        </Button>
    )
}
