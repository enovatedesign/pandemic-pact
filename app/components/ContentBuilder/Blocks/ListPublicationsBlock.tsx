"use client"

import { ReactNode, useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"

import { fetchPublicationEntries } from "../../../helpers/cms-sections"
import { fetchTotalSectionEntries } from "../../../helpers/cms-sections"

import BlockWrapper from "../BlockWrapper"
import Card from "../Common/Card"
import Pagination from "../Common/Pagination"
import { defaultProseClasses } from '@/app/helpers/prose-classes'
import { ExternalLinkIcon, ChevronRightIcon } from '@heroicons/react/outline'

type PublicationEntry = {
    id: number,
    title: string,
    summary: string,
    externalLink: string,
    postDate: number,
    thumbnailImage: {
        altText: string,
        height: number,
        url: string,
        width: number,
    }[],
    publicationType: string,
    dateCreated: any,
    typeHandle: string,
    uri: string,
}

type Props = {
    block: {
        id: string,
        typeHandle: string,
        heading: string,
        limit: number,
        paginate: boolean,
        customEntries: PublicationEntry[],
    }
}

const renderPublicationCards = (entries: PublicationEntry[]) => {
    return entries.map((entry, index: number) => {
        let cardData: any = {}
        let icon: ReactNode

        if (entry.typeHandle === 'externalPublication') {
            cardData = {
                title: entry.title,
                imageLabel: entry.publicationType,
                summary: entry.summary,
                summaryClasses: '',
                url: entry.externalLink,
                thumbnailImage: entry.thumbnailImage,
                postDate: entry.postDate,
            }
            icon = <ExternalLinkIcon className="w-6 h-6" />
        } else {
            cardData = {
                title: entry.title,
                imageLabel: 'Pandemic PACT',
                summary: entry.summary,
                summaryClasses: '',
                url: entry.uri,
                thumbnailImage: entry.thumbnailImage,
                postDate: entry.postDate,
            }
            icon = <ChevronRightIcon className="w-6 h-6" />
        }

        return (
            <Card entry={cardData} key={index} animatedIcon={icon}/>
        )
    })
}

const ListPublicationsBlockComponent = ({block}: Props) => {

    const {
        customEntries,
        limit,
        paginate,
    } = block

    const heading = block.heading ?? null

    const [entries, setEntries] = useState<PublicationEntry[] | undefined>(customEntries);
    const [firstItemIndex, setFirstItemIndex] = useState<number>(0)
    const [lastItemIndex, setLastItemIndex] = useState<number>(limit - 1)

    const limitedEntries = limit ? entries?.slice(0, limit) : entries
    const [paginatedEntries, setPaginatedEntries] = useState(entries?.slice(firstItemIndex, lastItemIndex))

    const [totalEntries, setTotalEntries] = useState<number>(0)

    const [isLoading, setIsLoading] = useState<boolean>(
        customEntries && customEntries.length > 0 ?
            false :
            true
    )

    const params = useSearchParams()
    const pageParam = params.get(`page`)

    useEffect(() => {
        if (customEntries?.length === 0 && paginate) {
            const pageNumber = pageParam ? Number(pageParam) : 1

            fetchPublicationEntries({
                body: {
                    limit: limit,
                    pageNumber: pageNumber,
                },
                setEntries: (data) => {
                    setPaginatedEntries(data),
                    setIsLoading(false)
                }
            })

            fetchTotalSectionEntries({
                body: {
                    sectionHandle: 'publications',
                },
                setTotal: setTotalEntries
            })

        } else if (customEntries?.length === 0 && !paginate) {
            fetchPublicationEntries({
                body: {
                    limit: limit,
                },
                setEntries: (data) => {
                    setEntries(data),
                    setIsLoading(false)
                }
            })

        } else if (customEntries && customEntries?.length > 0 && paginate) {
            setPaginatedEntries(customEntries.slice(firstItemIndex, lastItemIndex))
            setTotalEntries(customEntries.length)
        }
    }, [customEntries, customEntries?.length, firstItemIndex, lastItemIndex, limit, pageParam, paginate])

    const headingMarkup = heading ? (
        <div className={defaultProseClasses({ customClasses: 'text-center mb-12' })}>
            <h2 dangerouslySetInnerHTML={{ __html: heading }}></h2>
        </div>
    ) : null

    return (
        isLoading ? (
            <BlockWrapper>
                {headingMarkup}
                <p>
                    Loading Publications...
                </p>
            </BlockWrapper>
        ) : paginate && paginatedEntries && paginatedEntries.length > 0 ? (
            <BlockWrapper>
                {headingMarkup}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {renderPublicationCards(paginatedEntries)}
                </div>

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
                {headingMarkup}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {renderPublicationCards(limitedEntries)}
                </div>
            </BlockWrapper>
        ) : (
            <BlockWrapper>
                {headingMarkup}
                <p>
                    No publications exist currently, please check back soon.
                </p>
            </BlockWrapper>
        )
    )
}

const ListPublicationsBlock = (props: Props) => (
    <Suspense fallback={<div>Loading...</div>}>
        <ListPublicationsBlockComponent {...props} />
    </Suspense>
)

export default ListPublicationsBlock
