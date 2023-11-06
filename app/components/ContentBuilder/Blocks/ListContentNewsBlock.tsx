"use client"

import BlockWrapper from "../BlockWrapper";
import NewsCard from "../News/NewsCard";
import { useState, useEffect } from "react";
import { useInView, animated } from '@react-spring/web';
import Pagination from "../Common/Pagination";

type Props = {
    block: {
        customEntries: {
            url: string,
            title: string,
            summary: string
            thumbnailImage: {
              url: string,
              width: number,
              height: number,
              alt: string,
            }
        }
        limit: number,
        paginate: boolean,
        addTagsMenu: boolean,
    }
}

const ListContentNewsBlock = ( {block}: Props ) => {
    
    const limit = block.limit 
    const paginate = block.paginate ?? false
    const [currentPage, setCurrentPage] = useState(1)

    const lastPost = (currentPage * limit)
    const firstPost = (lastPost - limit)
    
    const customEntries = block.customEntries ?? null
    const limitedEntries = customEntries.slice(0, limit) 
    const paginatedEntries = customEntries.slice(firstPost, lastPost)

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
                        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {paginatedEntries.map((entry, index) => {
                                return <NewsCard entry={entry} key={index} tags={tags}/>
                            })}
                        </ul>
                    </animated.div>
                    
                    <Pagination 
                        totalPosts={customEntries.length}
                        postsPerPage={limit}
                        setCurrentPage={setCurrentPage}
                        currentPage={currentPage}
                    />
                </div>
            ) : (
                <animated.div ref={ref} style={springs}>
                    <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {limitedEntries.map((entry, index) => {
                            return <NewsCard entry={entry} key={index} tags={tags}/>
                        })}
                    </ul>
                </animated.div>
            )}
        </BlockWrapper>
    )
}

export default ListContentNewsBlock