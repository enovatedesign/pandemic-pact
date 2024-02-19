import { useState } from 'react'
import Button from './Button'
import { fetchCsv, downloadCsv } from '../helpers/export'
import { CloudDownloadIcon } from '@heroicons/react/outline'
import LoadingSpinner from '@tremor/react/dist/assets/LoadingSpinner'

export default function DownloadFullDataButton() {
    const [exportingCsv, setExportingCsv] = useState(false)

    const exportCsv = () => {
        if (exportingCsv) {
            return
        }

        setExportingCsv(true)

        fetchCsv()
            .then(csv => {
                downloadCsv(csv, 'pandemic-pact-grants.csv')
                setExportingCsv(false)
            })
            .catch(error => {
                console.error(error)
                setExportingCsv(false)
            })
    }

    const iconClasses = 'w-5 h-5'

    return (
        <Button
            disabled={exportingCsv}
            onClick={exportCsv}
            colour="grey"
            size="xsmall"
            customClasses="flex items-center justify-center self-start gap-2"
        >
            <span>Download Full Data</span>

            {exportingCsv ? (
                <LoadingSpinner
                    className={`${iconClasses} animate-spin shrink-0`}
                />
            ) : (
                <CloudDownloadIcon className={iconClasses} />
            )}
        </Button>
    )
}
