'use client'

import { useState, Suspense } from 'react'
import AnimateHeight from 'react-animate-height'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { ChevronDownIcon, ExternalLinkIcon } from '@heroicons/react/solid'
import Pagination from '@/app/components/ContentBuilder/Common/Pagination'
import Button from '../../components/Button'

dayjs.extend(relativeTime)

export default function Publications({ grant }: { grant: any }) {
    const limit = 10

    const [firstItemIndex, setFirstItemIndex] = useState(0)
    const [lastItemIndex, setLastItemIndex] = useState(limit - 1)
    const [activeIndex, setActiveIndex] = useState(-1)

    if (!(grant.PubMedLinks?.length > 0)) {
        return null
    }

    const publicationList = grant.PubMedLinks?.slice(
        firstItemIndex,
        lastItemIndex
    )

    const viewAllHref = `https://europepmc.org/search?query=GRANT_ID%3A%22${grant.PubMedGrantId}%22`

    return (
        <div className="flex flex-col space-y-4" id="paginationTop">
            <div className="flex flex-col gap-y-4 xl:gap-y-0 xl:flex-row xl:items-end xl:justify-between xl:gap-x-4">
                <h2
                    className="text-secondary text-base lg:text-lg"
                    id="publications"
                >
                    <span className="uppercase tracking-widest text-lg lg:text-xl font-medium pr-2">
                        Publications
                    </span>
                    linked via Europe PMC
                </h2>
                <div className="flex flex-col md:flex-row md:items-end md:justify-between xl:justify-normal gap-4">
                    <p className="text-gray-900 text-sm uppercase">
                        <span>Last Updated:</span>
                        <span
                            className="ml-1"
                            title={dayjs(publicationList[0].updated_at).toString()}
                        >
                            {dayjs(publicationList[0].updated_at).fromNow()}
                        </span>
                    </p>
                    <Button
                        href={viewAllHref}
                        colour='grey'
                        customClasses="flex items-center justify-between gap-2 lg:-translate-y-1"
                        size='small'
                    >
                        <span className="text-xs md:text-sm lg:text-base xl:text-base">View all publications at Europe PMC</span>
                        <ExternalLinkIcon className="size-5" />
                    </Button>

                </div>
            </div>

            <div>
                <div className="grid grid-cols-1 gap-3">
                    {publicationList.map((link: any, index: number) => {
                        const handleClick = () => {
                            activeIndex !== index
                                ? setActiveIndex(index)
                                : setActiveIndex(-1)
                        }

                        return (
                            <div
                                key={index}
                                className="bg-primary/20 py-4 px-6 rounded-2xl"
                            >
                                <a
                                    className="flex items-center justify-between space-x-2 cursor-pointer"
                                    onClick={handleClick}
                                >
                                    <h3
                                        className="text-left font-bold tracking-wider text-md md:text-xl lg:text-2xl"
                                        dangerouslySetInnerHTML={{
                                            __html: link.title,
                                        }}
                                    ></h3>
                                    <button className="self-start">
                                        <ChevronDownIcon
                                            className={`${
                                                activeIndex === index &&
                                                '-rotate-180'
                                            } transition duration-300 w-10 h-10`}
                                        />
                                    </button>
                                </a>

                                <AnimateHeight
                                    duration={300}
                                    height={activeIndex === index ? 'auto' : 0}
                                >
                                    <ul className="py-6 flex flex-col gap-4">
                                        <li className="flex flex-col gap-1">
                                            <h4 className="text-gray-600 uppercase tracking-wider font-bold text-xs">
                                                Authors
                                            </h4>
                                            <p className="tracking-wider text-gray-500">
                                                {link.authorString}
                                            </p>
                                        </li>
                                        <li className="flex flex-col gap-1">
                                            <h4 className="text-gray-600 uppercase tracking-wider font-bold text-xs">
                                                Publish Year
                                            </h4>
                                            <p className="tracking-wider text-gray-500">
                                                {link.pubYear}
                                            </p>
                                        </li>
                                        {link.journalInfo?.journal?.title && (
                                            <li className="flex flex-col gap-1">
                                                <h4 className="text-gray-600 uppercase tracking-wider font-bold text-xs">
                                                    Journal
                                                </h4>
                                                <p className="tracking-wider text-gray-500">
                                                    {
                                                        link.journalInfo.journal
                                                            .title
                                                    }
                                                </p>
                                            </li>
                                        )}
                                        <li className="flex flex-col gap-1">
                                            <h4 className="text-gray-600 uppercase tracking-wider font-bold text-xs">
                                                DOI
                                            </h4>
                                            <p className="tracking-wider text-gray-500">
                                                {link.doi}
                                            </p>
                                        </li>
                                    </ul>
                                    <div className="py-4 flex">
                                        <Button
                                            size="small"
                                            colour="secondary"
                                            href={`https://europepmc.org/article/${link.source}/${link.pmid}`}
                                            rel="nofollow noopener noreferrer"
                                            target="_blank"
                                            customClasses="flex items-center justify-center self-start gap-2"
                                        >
                                            <span>View at Europe PMC</span>
                                            <ExternalLinkIcon className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </AnimateHeight>
                            </div>
                        )
                    })}
                </div>

                {grant.PubMedLinks?.length > 10 && (
                    <Suspense fallback={null}>
                        <Pagination
                            totalPosts={grant.PubMedLinks?.length}
                            postsPerPage={limit}
                            setLastItemIndex={setLastItemIndex}
                            setFirstItemIndex={setFirstItemIndex}
                            setActiveIndex={setActiveIndex}
                        />
                    </Suspense>
                )}
            </div>
        </div>
    )
}
