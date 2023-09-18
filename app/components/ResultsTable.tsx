import Link from "next/link"
import {Card, Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell} from "@tremor/react"
import {SearchResponse, SearchResult} from "../types/search"

interface Props {
    searchResponse: SearchResponse,
}

export default function ResultsTable({searchResponse}: Props) {
    return (
        <Card>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeaderCell className="font-bold">Grant Name</TableHeaderCell>
                        <TableHeaderCell className="text-right"></TableHeaderCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {searchResponse.hits.map((result) => {
                        const query = searchResponse.query
                        const href = `/grants/${result.GrantID}` + (query ? `?q=${query}` : '')

                        return (
                            <TableRow key={result.GrantID}>
                                <TableCell className="flex flex-col gap-y-2">
                                    <div
                                        className="whitespace-normal font-semibold"
                                        dangerouslySetInnerHTML={{__html: result._formatted.GrantTitleEng}}
                                    />

                                    {searchResponse.query &&
                                        <SearchMatches result={result} />
                                    }
                                </TableCell>

                                <TableCell className="text-right whitespace-nowrap truncate">
                                </TableCell>

                                <TableCell className="text-right whitespace-nowrap truncate align-top">
                                    <Link
                                        href={href}
                                        className="text-blue-500"
                                    >View Grant</Link>
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
    let matches = [
        {label: "Title", count: result._formatted.GrantTitleEng?.match(/class="highlighted-search-result-token">/g)?.length ?? 0},
        {label: "Abstract", count: result._formatted.Abstract?.match(/class="highlighted-search-result-token">/g)?.length ?? 0},
        {label: "Lay Summary", count: result._formatted.LaySummary?.match(/class="highlighted-search-result-token">/g)?.length ?? 0},
    ]

    matches.push({
        label: "Total",
        count: matches.reduce((total, {count}) => total + count, 0)
    })

    const matchText = matches.filter(({count}) => count > 0)
        .map(({label, count}) => `${count} in ${label}`)
        .join(', ')

    return (
        <div className="text-xs italic">
            <span className="font-semibold">Word Matches In Fields</span>: {matchText}
        </div>
    )
}
