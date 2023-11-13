"use client"

import BlockWrapper from "../BlockWrapper";
import Card from "../Common/Card";
import { useState, useEffect } from "react";
import { useInView, animated } from '@react-spring/web';
import Pagination from "../Common/Pagination";
import Button from "../../Button";

type Props = {
    block: {
        newsEntries: {
            url: string,
            title: string,
            summary: string
            thumbnailImage: {
              url: string,
              width: number,
              height: number,
              alt: string,
            },
        }[],
        customEntries: {
            url: string,
            title: string,
            summary: string
            thumbnailImage: {
              url: string,
              width: number,
              height: number,
              alt: string,
            },
        }[],
        limit: number,
        paginate: boolean,
        addTagsMenu: boolean,
    }
}


const ListContentNewsBlock = ( {block}: Props ) => {
    
    const limit = block.limit 
    const paginate = block.paginate ?? false
    const [firstItemIndex, setFirstItemIndex] = useState(0)
    const [lastItemIndex, setLastItemIndex] = useState(limit - 1)

    const customEntries = block.customEntries ?? null
    const limitedEntries = customEntries.slice(0, limit) 
    const [paginatedEntries, setPaginatedEntries] = useState(customEntries.slice(firstItemIndex, lastItemIndex))

    useEffect(() => {
        setPaginatedEntries(customEntries.slice(firstItemIndex, lastItemIndex))
    }, [customEntries, firstItemIndex, lastItemIndex])

    const tags = block.addTagsMenu ?? false

    const [ref, springs] = useInView(
        () => ({
            from: {
                opacity: 0,
                y: 100,
            },
            to: {
                opacity: 1,
                y: 0,
            },
        }),
        {
            once: true,
        }
    );

    return(
        <BlockWrapper>

            {paginate ? (
                <div>
                    <animated.div ref={ref} style={springs}>
                        <ul className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {paginatedEntries.map((entry, index: number) => {
                                return (
                                    <Card entry={entry} key={index} tags={tags}>
                                        <Button
                                            size="small"
                                            href={entry.url}
                                        >
                                            Read more
                                        </Button>
                                    </Card>
                                ) 
                            })}
                        </ul>
                    </animated.div>
                    
                    <Pagination 
                        totalPosts={customEntries.length}
                        postsPerPage={limit}
                        setFirstItemIndex={setFirstItemIndex}
                        setLastItemIndex={setLastItemIndex}
                    />
                </div>
            ) : (
                <animated.div ref={ref} style={springs}>
                    <ul className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {limitedEntries.map((entry, index: number) => {
                            return (
                                <Card entry={entry} key={index} tags={tags}>
                                    <Button
                                        size="small"
                                        href={entry.url}
                                    >
                                        Read more
                                    </Button>
                                </Card>
                            )
                        })}
                    </ul>
                </animated.div>
            )}
        </BlockWrapper>
    )
}

export default ListContentNewsBlock