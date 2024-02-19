import { useState, useContext } from 'react'
import { DownloadIcon } from '@heroicons/react/solid'
import { countActiveFilters, GlobalFilterContext } from '../../helpers/filters'
import {
    fetchCsv,
    filterCsv,
    downloadCsv,
    fullDataFilename,
    filteredDataFilename,
} from '../../helpers/export'
import Button from './Button'

export default function ExportDataMenuItem() {
    const { filters, grants } = useContext(GlobalFilterContext)

    const [exportingCsv, setExportingCsv] = useState(false)

    const exportCsv = () => {
        if (exportingCsv) {
            return
        }

        setExportingCsv(true)

        fetchCsv()
            .then(csv => {
                let filteredCsv = csv

                const filtersAreActive = countActiveFilters(filters) > 0

                if (filtersAreActive) {
                    filteredCsv = filterCsv(
                        filteredCsv,
                        grants.map(grant => grant.GrantID)
                    )
                }

                downloadCsv(
                    filteredCsv,
                    filtersAreActive ? filteredDataFilename : fullDataFilename
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
