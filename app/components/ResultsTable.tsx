import Link from "next/link"
import {Card, Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell} from "@tremor/react"
import {SearchResponse, SearchResult} from "../types/search"

interface Props {
    searchResponse: SearchResponse,
}

export default function ResultsTable({searchResponse}: Props) {
    console.log(searchResponse);

    return (
        <Card>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeaderCell>Grant Name</TableHeaderCell>
                        <TableHeaderCell>Search Matches</TableHeaderCell>
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
                                    className="max-w-md truncate"
                                    dangerouslySetInnerHTML={{__html: result._formatted.GrantTitleEng}}
                                />

                                <SearchMatches result={result} />

                                <TableCell className="text-right whitespace-nowrap truncate">
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

interface SearchMatchesProps {
    result: SearchResult
}

function SearchMatches({result}: SearchMatchesProps) {
    const matches = [
        {label: "Title", count: result._formatted.GrantTitleEng?.match(/class="highlighted-search-result-token">/g)?.length ?? 0},
        {label: "Abstract", count: result._formatted.Abstract?.match(/class="highlighted-search-result-token">/g)?.length ?? 0},
        {label: "Lay Summary", count: result._formatted.LaySummary?.match(/class="highlighted-search-result-token">/g)?.length ?? 0},
    ].filter(({count}) => count > 0)
        .map(({label, count}) => `${label}: ${count}`)
        .join(', ')

    return (
        <TableCell>
            {matches}
        </TableCell>
    )
}
