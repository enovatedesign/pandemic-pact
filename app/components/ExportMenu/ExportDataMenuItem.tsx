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
    filterIdKey = 'GrantID',
    label = 'Export Chart Data (CSV)',
    ids,
    className = 'rounded-b-md',
}: {
    filenameToFetch?: string,
    filteredFileName?: string,
    filterContext?: React.Context<any>,
    dataKey?: string,
    filterIdKey?: string,
    label?: string,
    /**
     * Restricts the export to these record ids, regardless of whether any global
     * filter is active — used by charts whose own controls (e.g. a tab) narrow
     * the data further than the sidebar does.
     */
    ids?: string[],
    className?: string,
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

                // An explicit id list is already the narrowed selection, so it
                // always applies — the chart's own controls narrow the data even
                // when the sidebar is untouched.
                const restrictToIds =
                    ids ??
                    (filtersAreActive
                        ? items.map((item: any) => item[filterIdKey])
                        : undefined)

                if (restrictToIds) {
                    filteredCsv = filterCsv(filteredCsv, restrictToIds)
                }

                downloadCsv(
                    filteredCsv,
                    restrictToIds ? filteredFileName : filenameToFetch
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
            label={label}
            onClick={exportCsv}
            loading={exportingCsv}
            className={className}
        />
    )
}
