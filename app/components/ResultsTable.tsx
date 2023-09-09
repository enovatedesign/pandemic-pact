import Link from "next/link"
import {Card, Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell} from "@tremor/react"
import {type SearchResponse} from "../types/search"

interface Props {
    searchResponse: SearchResponse,
}

export default function ResultsTable({searchResponse}: Props) {
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
                    {searchResponse.hits.map((result) => {
                        const query = searchResponse.query
                        const href = `/grants/${result.GrantID}` + (query ? `?q=${query}` : '')

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
