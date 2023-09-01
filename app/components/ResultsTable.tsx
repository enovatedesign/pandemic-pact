import Link from "next/link"
import {Button, Card, Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell} from "@tremor/react"
import {type SearchResults} from "../types/search-results"

export default function ResultsTable({searchResults}: {searchResults: SearchResults}) {
    return (
        <Card>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeaderCell>Grant Name</TableHeaderCell>
                        <TableHeaderCell className="text-right"></TableHeaderCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {searchResults.map((result) => {
                        return (
                            <TableRow key={result.GrantID}>
                                <TableCell
                                    className="whitespace-normal"
                                    dangerouslySetInnerHTML={{__html: result._formatted.GrantTitleEng}}
                                />
                                <TableCell className="text-right whitespace-nowrap">
                                    <Link href={`/grants/${result.GrantID}`}>View Grant</Link>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </Card >
    )
}
