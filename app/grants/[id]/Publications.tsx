'use client'

import { useState, Suspense } from 'react'
import AnimateHeight from 'react-animate-height'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { ChevronDownIcon, ExternalLinkIcon, ChevronRightIcon } from '@heroicons/react/solid'
import Pagination from '@/app/components/ContentBuilder/Common/Pagination'
import Button from '@/app/components/Button'

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

    return (
        <div className="flex flex-col space-y-4" id="paginationTop">
            <div className="flex items-end justify-between gap-x-4">
                <h2
                    className="text-secondary text-base lg:text-lg"
                    id="publications"
                >
                    <span className="uppercase tracking-widest text-lg lg:text-xl font-medium pr-2">
                        Publications
                    </span>
                    linked via Europe PMC
                </h2>
                <div className="flex items-end gap-4">
                    <p className="text-gray-900 text-sm uppercase">
                        <span>Last Updated:</span>
                        <span
                            className="ml-1"
                            title={dayjs(publicationList[0].updated_at).toString()}
                        >
                            {dayjs(publicationList[0].updated_at).fromNow()}
                        </span>
                    </p>
                    <a
                        href="#"
                        className="bg-secondary text-white rounded-full px-2 py-1 lg:px-4 lg:py-2 flex items-center gap-2 border-2 border-secondary hover:border-primary transition-colors duration-300 -translate-y-1"
                    >
                        View all publications at Europe PMC
                        <div className="aspect-square rounded-full border-2 border-white flex justify-center items-center">
                            <ChevronRightIcon className="w-4 h-4" />
                        </div>
                    </a>

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
                                            <h4 className="text-gray-500 uppercase tracking-wider font-bold text-xs">
                                                Authors
                                            </h4>
                                            <p className="tracking-wider text-tremor-content-emphasis">
                                                {link.authorString}
                                            </p>
                                        </li>
                                        <li className="flex flex-col gap-1">
                                            <h4 className="text-gray-500 uppercase tracking-wider font-bold text-xs">
                                                Publish Year
                                            </h4>
                                            <p className="tracking-wider text-tremor-content-emphasis">
                                                {link.pubYear}
                                            </p>
                                        </li>
                                        {link.journalInfo?.journal?.title && (
                                            <li className="flex flex-col gap-1">
                                                <h4 className="text-gray-500 uppercase tracking-wider font-bold text-xs">
                                                    Journal
                                                </h4>
                                                <p className="tracking-wider text-tremor-content-emphasis">
                                                    {
                                                        link.journalInfo.journal
                                                            .title
                                                    }
                                                </p>
                                            </li>
                                        )}
                                        <li className="flex flex-col gap-1">
                                            <h4 className="text-gray-500 uppercase tracking-wider font-bold text-xs">
                                                DOI
                                            </h4>
                                            <p className="tracking-wider text-tremor-content-emphasis">
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
