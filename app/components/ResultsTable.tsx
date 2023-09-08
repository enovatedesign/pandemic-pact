import Link from "next/link"
import {Card, Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell} from "@tremor/react"
import {type SearchResults} from "../types/search-results"

interface Props {
    searchQuery: string,
    searchResults: SearchResults,
}

export default function ResultsTable({searchQuery, searchResults}: Props) {
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
                        const href = `/grants/${result.GrantID}` + (searchQuery ? `?q=${searchQuery}` : '')

                        return (
                            <TableRow key={result.GrantID}>
                                <TableCell
                                    className="whitespace-normal"
                                    dangerouslySetInnerHTML={{__html: result._formatted.GrantTitleEng}}
                                />
                                <TableCell className="text-right whitespace-nowrap">
                                    <Link href={href}>View Grant</Link>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </Card >
    )
}
