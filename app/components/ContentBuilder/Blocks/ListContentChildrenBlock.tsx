"use client"

import { useEffect, useState, useContext, Suspense } from "react"
import { useSearchParams } from "next/navigation"

import { CardEntryProps, CardEntriesProps } from "@/app/helpers/types"
import { fetchChildrenEntries, fetchTotalChildrenEntries } from "@/app/helpers/cms-sections"
import { CurrentEntry } from "@/app/helpers/context"
import { allowedSectionQueries } from "@/app/helpers/allowed-section-queries"

import BlockWrapper from "../BlockWrapper"
import Card from "../Common/Card"
import Pagination from "../Common/Pagination"
import { ChevronRightIcon } from "@heroicons/react/outline"

interface ListContentChildrenProps {
    block: {
        id: number,
        customEntries?: CardEntriesProps | undefined,
        limit: number,
        paginate: boolean,
    }
}

const ListContentChildrenBlockComponent = ({ block }: ListContentChildrenProps) => {
    const { customEntries, limit, paginate, id } = block
    const { sectionHandle, uri, typeHandle } = useContext(CurrentEntry)

    const [entries, setEntries] = useState<CardEntriesProps | undefined>(customEntries);
    const [firstItemIndex, setFirstItemIndex] = useState<number>(0)
    const [lastItemIndex, setLastItemIndex] = useState<number>(limit - 1)

    const limitedEntries = entries?.slice(0, limit)
    const [paginatedEntries, setPaginatedEntries] = useState(entries?.slice(firstItemIndex, lastItemIndex))

    const [totalEntries, setTotalEntries] = useState<number>(0)

    const [isLoading, setIsLoading] = useState<boolean>(
        customEntries && customEntries.length > 0 ? false : true
    )

    const params = useSearchParams()
    const pageParam = params.get('page')

    useEffect(() => {
        if (!allowedSectionQueries.includes(sectionHandle)) {
            setIsLoading(false)
            return
        }

        if (customEntries?.length === 0 && paginate) {
            const pageNumber = pageParam ? Number(pageParam) : 1

            fetchChildrenEntries({
                body: {
                    sectionHandle,
                    uri,
                    typeHandle,
                    limit,
                    pageNumber,
                },
                setEntries: (data) => {
                    setPaginatedEntries(data)
                    setIsLoading(false)
                }
            }).catch(() => setIsLoading(false))

            fetchTotalChildrenEntries({
                body: {
                    sectionHandle,
                    uri,
                    typeHandle,
                },
                setTotal: setTotalEntries
            }).catch(() => {})

        } else if (customEntries?.length === 0 && !paginate) {
            fetchChildrenEntries({
                body: {
                    sectionHandle,
                    uri,
                    typeHandle,
                    limit,
                },
                setEntries: (data) => {
                    setEntries(data)
                    setIsLoading(false)
                }
            }).catch(() => setIsLoading(false))

        } else if (customEntries && customEntries?.length > 0 && paginate) {
            setPaginatedEntries(customEntries.slice(firstItemIndex, lastItemIndex))
            setTotalEntries(customEntries.length)
            setIsLoading(false)
        } else {
            setIsLoading(false)
        }
    }, [customEntries, customEntries?.length, firstItemIndex, lastItemIndex, limit, pageParam, paginate, sectionHandle, typeHandle, uri])

    if (isLoading) return null

    return (
        paginate && paginatedEntries && paginatedEntries.length > 0 ? (
            <BlockWrapper>
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 !list-none">
                    {paginatedEntries?.map((entry: CardEntryProps, index: number) => {
                        return (
                            <li key={index}>
                                <Card entry={entry}/>
                            </li>
                        )
                    })}
                </ul>

                {totalEntries > limit && (
                    <Pagination
                        totalPosts={totalEntries}
                        postsPerPage={limit}
                        setFirstItemIndex={setFirstItemIndex}
                        setLastItemIndex={setLastItemIndex}
                    />
                )}
            </BlockWrapper>
        ) : limitedEntries && limitedEntries.length > 0 ? (
            <BlockWrapper>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 !list-none">
                    {limitedEntries.map((entry: CardEntryProps, index: number) => {
                        return (
                            <li key={index}>
                                <Card
                                    entry={entry}
                                    animatedIcon={<ChevronRightIcon className="w-6 h-6" />}
                                />
                            </li>
                        )
                    })}
                </div>
            </BlockWrapper>
        ) : null
    )
}

const ListContentChildrenBlock = (props: ListContentChildrenProps) => (
    <Suspense fallback={null}>
        <ListContentChildrenBlockComponent {...props} />
    </Suspense>
)

export default ListContentChildrenBlock
