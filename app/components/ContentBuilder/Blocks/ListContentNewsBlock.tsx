"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"

import { fetchSectionEntries, fetchTotalSectionEntries } from "../../../helpers/cms-sections"
import { CardEntryProps, CardEntriesProps } from "@/app/helpers/types"

import BlockWrapper from "../BlockWrapper"
import Card from "../Common/Card"
import Pagination from "../Common/Pagination"
import { ChevronRightIcon } from "@heroicons/react/outline"

interface ListContentNewsProps {
    blockHandle: string
    block: {
        customEntries?: CardEntriesProps | undefined,
        limit: number,
        paginate: boolean,
    }
}

const ListContentNewsBlock = ({block}: ListContentNewsProps) => {
    const {
        customEntries,
        limit,
        paginate,
    } = block

    const sectionHandle = 'news'
    const entryTypeHandle = 'newsArticle'

    const [entries, setEntries] = useState<CardEntriesProps | undefined>(customEntries);
    const [firstItemIndex, setFirstItemIndex] = useState<number>(0)
    const [lastItemIndex, setLastItemIndex] = useState<number>(limit - 1)
    
    const limitedEntries = entries?.slice(0, limit) 
    const [paginatedEntries, setPaginatedEntries] = useState(entries?.slice(firstItemIndex, lastItemIndex))
    
    const [totalEntries, setTotalEntries] = useState<number>(0)

    const params = useSearchParams()
    const pageParam = params.get(`page`)

    useEffect(() => {
        if (customEntries?.length === 0 && paginate) {
            
            const pageNumber = pageParam ? Number(pageParam) : 1
            
            fetchSectionEntries({
                body: {
                    sectionHandle: sectionHandle,
                    entryTypeHandle: entryTypeHandle,
                    limit: limit,
                    pageNumber: pageNumber,  
                },
                setEntries: setPaginatedEntries,
            })

            fetchTotalSectionEntries({
                body: {
                    sectionHandle: sectionHandle,
                },
                setTotal: setTotalEntries
            })
            
        } else if (customEntries?.length === 0 && !paginate) {
            fetchSectionEntries({
                body: {
                    sectionHandle: sectionHandle,
                    entryTypeHandle: entryTypeHandle,
                    limit: limit,
                },
                setEntries: setEntries,
            })
        } else if (customEntries && customEntries?.length > 0 && paginate) {
            setPaginatedEntries(customEntries.slice(firstItemIndex, lastItemIndex))
            setTotalEntries(customEntries.length)
        }  
    }, [customEntries, customEntries?.length, firstItemIndex, lastItemIndex, limit, pageParam, paginate])
    
    return (
        <Suspense fallback={<div>Loading...</div>}>
            {paginate && paginatedEntries && paginatedEntries.length > 0 ? (
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

                    <Pagination 
                        totalPosts={totalEntries}
                        postsPerPage={limit}
                        setFirstItemIndex={setFirstItemIndex}
                        setLastItemIndex={setLastItemIndex}
                    />
                </BlockWrapper>
            ) : (
                <>
                    {limitedEntries && limitedEntries.length > 0 && (
                        <BlockWrapper>
                            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 !list-none">
                                {limitedEntries?.map((entry: CardEntryProps, index: number) => {
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
                    )}
                </>
            )}
        </Suspense>
    )
}

export default ListContentNewsBlock

