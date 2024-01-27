import {useState, useContext} from 'react'
import {DownloadIcon} from '@heroicons/react/solid'
import {countActiveFilters, GlobalFilterContext} from "../../helpers/filter"
import Button from "./Button"

interface Props {
    dataFilename: string
}

export default function ExportDataMenuItem({dataFilename}: Props) {
    const {filters, grants} = useContext(GlobalFilterContext)

    const [exportingCsv, setExportingCsv] = useState(false)

    const exportCsv = () => {
        if (exportingCsv) {
            return
        }

        setExportingCsv(true)

        fetch('https://b8xcmr4pduujyuoo.public.blob.vercel-storage.com/labelled-grant-data-2023-11-23.csv').then(
            response => response.text()
        ).then(
            csv => {
                const grantIDs = grants.map(grant => grant.GrantID)

                let filteredCsv = csv;

                if (countActiveFilters(filters) > 0) {
                    // Rather than attempting to parse the CSV, we can take advantage of
                    // the fact that the first column is the Grant ID, and filter based on that,
                    // thereby improving performance.
                    filteredCsv = filteredCsv.split('\n')
                        .filter((line, index) => {
                            // Always include the header row
                            if (index === 0) {
                                return true
                            }

                            // Check if the first column contains one of our filtered Grant IDs
                            return grantIDs.some(
                                id => line.startsWith(`${id},`)
                            )
                        }).join('\n')
                }

                const blob = new Blob([filteredCsv], {type: 'text/csv'})
                const url = window.URL.createObjectURL(blob)

                const a = document.createElement('a')
                a.href = url
                a.download = dataFilename
                a.click()

                window.URL.revokeObjectURL(url)
                a.remove()

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
