import { useState } from 'react'
import Button from './Button'
import {
    searchRequest,
    SearchRequestBody,
    queryOrFiltersAreSet,
} from '../helpers/search'
import {
    fetchCsv,
    filterCsv,
    downloadCsv,
    filteredDataFilename,
} from '../helpers/export'
import { CloudDownloadIcon } from '@heroicons/react/outline'
import LoadingSpinner from '@tremor/react/dist/assets/LoadingSpinner'

interface Props {
    searchRequestBody: SearchRequestBody
}

export default function DownloadFilteredDataButton({
    searchRequestBody,
}: Props) {
    const [exportingCsv, setExportingCsv] = useState(false)

    const exportCsv = () => {
        if (exportingCsv) {
            return
        }

        setExportingCsv(true)

        Promise.all([
            fetchCsv(),
            queryOrFiltersAreSet(searchRequestBody)
                ? searchRequest('export', searchRequestBody)
                : Promise.resolve(null),
        ])
            .then(responses => {
                const [csv, searchResponse] = responses

                let filteredCsv = csv

                if (searchResponse !== null) {
                    filteredCsv = filterCsv(
                        filteredCsv,
                        searchResponse.grantIDs
                    )
                }

                downloadCsv(filteredCsv, filteredDataFilename)

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
            <span>Download Filtered Data</span>

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
