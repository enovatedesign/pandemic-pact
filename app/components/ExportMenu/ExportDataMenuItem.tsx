import {useState, useContext} from 'react'
import {DownloadIcon} from '@heroicons/react/solid'
import {countActiveFilters, GlobalFilterContext} from "../../helpers/filter"
import {fetchCsv, filterCsv, downloadCsv} from "../../helpers/export"
import Button from "./Button"

interface Props {
    filename: string
}

export default function ExportDataMenuItem({filename}: Props) {
    const {filters, grants} = useContext(GlobalFilterContext)

    const [exportingCsv, setExportingCsv] = useState(false)

    const exportCsv = () => {
        if (exportingCsv) {
            return
        }

        setExportingCsv(true)

        fetchCsv().then(
            csv => {
                let filteredCsv = csv

                if (countActiveFilters(filters) > 0) {
                    filteredCsv = filterCsv(
                        filteredCsv,
                        grants.map(grant => grant.GrantID),
                    )
                }

                downloadCsv(filteredCsv, filename)

                setExportingCsv(false)
            }
        ).catch(
            error => {
                console.error(error)

                setExportingCsv(false)
            }
        )
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
