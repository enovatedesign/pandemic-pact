import { useState, useContext } from 'react'
import { DownloadIcon } from '@heroicons/react/solid'
import { GlobalFilterContext } from '../../helpers/filters'
import {
    fetchCsv,
    filterCsv,
    downloadCsv,
    fullDataFilename,
    filteredDataFilename,
} from '../../helpers/export'
import Button from './Button'

export default function ExportDataMenuItem({ 
    filenameToFetch = fullDataFilename, 
    filteredFileName = filteredDataFilename,
    filterContext = GlobalFilterContext,
    dataKey = 'grants',
    filterIdKey = 'GrantID'
}: { 
    filenameToFetch?: string,
    filteredFileName?: string,
    filterContext?: React.Context<any>,
    dataKey?: string,
    filterIdKey?: string,
}) {
    const context = useContext(filterContext)
    const { filters } = context
    const items = context[dataKey]

    const [exportingCsv, setExportingCsv] = useState(false)

    const exportCsv = () => {
        if (exportingCsv) {
            return
        }

        setExportingCsv(true)

        fetchCsv(filenameToFetch)
            .then(csv => {
                let filteredCsv = csv

                // Support both filter shapes used across the app: the grants
                // `Filters` object ({ [key]: { values: string[] } }) and the RRNA
                // filter map ({ [key]: string[] }). A filter is active when it has
                // any selected values.
                const filtersAreActive = Object.values(filters).some((filter: any) =>
                    Array.isArray(filter)
                        ? filter.length > 0
                        : (filter?.values?.length ?? 0) > 0
                )

                if (filtersAreActive) {
                    filteredCsv = filterCsv(
                        filteredCsv,
                        items.map((item: any) => item[filterIdKey])
                    )
                }

                downloadCsv(
                    filteredCsv,
                    filtersAreActive ? filteredFileName : filenameToFetch
                )

                setExportingCsv(false)
            })
            .catch(error => {
                console.error(error)

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
