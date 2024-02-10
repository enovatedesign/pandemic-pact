"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import AnimateHeight from "react-animate-height"
import {
    ChevronDownIcon,
    ChevronLeftIcon,
    ExternalLinkIcon,
    ArrowRightIcon,
} from "@heroicons/react/solid"
import { debounce } from "lodash"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import Link from "next/link"
import Layout from "../../components/Layout"
import RichText from "@/app/components/ContentBuilder/Common/RichText"
import Pagination from "@/app/components/ContentBuilder/Common/Pagination"
import Button from "@/app/components/Button"
import "/app/css/components/results-table.css"
import "/app/css/components/breakout.css"
import { searchRequest } from "../../helpers/search"
import KeyFacts from "./KeyFacts"

dayjs.extend(relativeTime)

interface SearchableFieldResults {
    GrantTitleEng: string
    Abstract: string
    LaySummary: string | null
}

interface Props {
    grant: any
}

export default function StaticPage({ grant }: Props) {
    const titleClasses = [
        "text-secondary uppercase tracking-widest text-lg lg:text-xl font-medium",
    ].join(" ")

    const [abstractShow, setAbstractShow] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)

    const limit = 10
    const [firstItemIndex, setFirstItemIndex] = useState(0)
    const [lastItemIndex, setLastItemIndex] = useState(limit - 1)
    const publicationList = grant.PubMedLinks?.slice(
        firstItemIndex,
        lastItemIndex
    )
    const [readMore, setReadMore] = useState(false)
    const [backgroundShow, setBackgroundShow] = useState(true)
    const [animateHeight, setAnimateHeight] = useState<"auto" | number>("auto")

    useEffect(() => {
        const abstract = document.getElementById("abstract")
        const hasReadMore = (abstract?.offsetHeight || 0) > 230

        const checkHeight = () => {
            setReadMore(hasReadMore)
            setAnimateHeight(hasReadMore ? 230 : "auto")
        }

        const debouncedCheckHeight = debounce(checkHeight, 200)

        if (document.readyState === "complete") {
            checkHeight()
        } else {
            window.addEventListener("load", checkHeight)
        }

        window.addEventListener("resize", debouncedCheckHeight)

        return () => {
            window.removeEventListener("load", checkHeight)
            window.removeEventListener("resize", debouncedCheckHeight)
        }
    }, [readMore])

    useEffect(() => {
        const handleBackground = () => {
            if (readMore) {
                setBackgroundShow(true)
            } else {
                setBackgroundShow(false)
            }
        }

        const debouncedBackground = debounce(handleBackground, 200)

        if (document.readyState === "complete") {
            handleBackground()
        } else {
            window.addEventListener("load", handleBackground)
        }

        window.addEventListener("resize", debouncedBackground)

        return () => {
            window.removeEventListener("load", handleBackground)
            window.removeEventListener("resize", debouncedBackground)
        }
    }, [backgroundShow, readMore])

    const searchParams = useSearchParams()
    const query = searchParams.get("q")

    const grantSearchLink = query ? `/grants?q=${query}` : "/grants"

    const [searchableFieldResults, setSearchableFieldResults] =
        useState<SearchableFieldResults>({
            GrantTitleEng: grant.GrantTitleEng,
            Abstract: grant.Abstract,
            LaySummary: grant.LaySummary,
        })

    useEffect(() => {
        const searchQueryFromUrl = searchParams.get("q") ?? ""

        if (!searchQueryFromUrl) {
            return
        }

        searchRequest("show", {
            q: searchQueryFromUrl,
            filters: {
                logicalAnd: false,
                filters: [
                    {
                        field: "GrantID",
                        values: [grant.GrantID],
                        logicalAnd: false,
                    },
                ],
            },
        })
            .then((data) => {
                const hit = data.hits[0]

                setSearchableFieldResults({
                    GrantTitleEng:
                        hit.highlight.GrantTitleEng ?? grant.GrantTitleEng,
                    Abstract: hit.highlight.Abstract ?? grant.Abstract,
                    LaySummary: hit.highlight.LaySummary ?? grant.LaySummary,
                })
            })
            .catch((error) => {
                console.error("Error:", error)
            })
    }, [searchParams, grant, setSearchableFieldResults])

    const mastheadContent = () => {
        return (
            <>
                <div className="mt-4 flex flex-col gap-4 md:flex-row items-start justify-between md:items-center">
                    <ul className="text-xl lg:text-2xl text-gray-300 flex flex-col md:flex-row items-start md:items-center justify-start gap-4">
                        <li>
                            Funded by{" "}
                            <span className="font-medium text-primary">
                                {grant.FundingOrgName.join(", ")}
                            </span>
                        </li>
                        <li className="flex">
                            <span className="sr-only">Total publications:</span>
                            <a
                                href="#publications"
                                className="z-10 inline-block bg-primary px-2.5 rounded-lg tracking-wider font-bold py-0.5 text-sm uppercase text-secondary whitespace-nowrap"
                            >
                                {grant.PubMedLinks?.length ?? "0"} publications
                            </a>
                        </li>
                    </ul>
                    {grant.PubMedGrantId && (
                        <p className="text-white/80">
                            Grant number:{" "}
                            <span className="text-white/60 font-bold uppercase whitespace-nowrap">
                                {grant.PubMedGrantId}
                            </span>
                        </p>
                    )}
                </div>
            </>
        )
    }

    return (
        <Layout
            title={searchableFieldResults.GrantTitleEng}
            mastheadContent={mastheadContent()}
        >
            <div className="container mx-auto my-12 relative">
                <Link
                    href={grantSearchLink}
                    className="absolute right-12 lg:right-20 bg-secondary text-white rounded-full px-2 py-1 lg:px-4 lg:py-2 -translate-y-1/2 flex items-center gap-2 border-2 border-secondary hover:border-primary transition-colors duration-300"
                >
                    <div className="aspect-square rounded-full border-2 border-white flex justify-center items-center">
                        <ChevronLeftIcon className="w-4 h-4" />
                    </div>
                    <span className="uppercase tracking-wider font-medium">
                        Grant search
                    </span>
                </Link>

                <div className="gap-6">
                    <div className="flex flex-col gap-6 bg-white p-6 lg:p-12 rounded-2xl border-2 border-gray-200">
                        <div className="grant-abstract flex flex-col space-y-4">
                            <h3 className={titleClasses}>Abstract</h3>
                            <AnimateHeight
                                duration={300}
                                height={abstractShow ? "auto" : animateHeight}
                                className="relative"
                            >
                                <div id="abstract">
                                    <RichText
                                        text={searchableFieldResults.Abstract}
                                        customClasses="max-w-none"
                                    />
                                    {backgroundShow && !abstractShow && (
                                        <div className="absolute inset-0 top-0 left-0  bg-gradient-to-b from-transparent to-white transition duration-300" />
                                    )}
                                </div>
                            </AnimateHeight>
                            {readMore && (
                                <button
                                    onClick={() =>
                                        setAbstractShow(!abstractShow)
                                    }
                                    className="w-auto uppercase font-bold text-tremor-emphasis tracking-wider flex items-center"
                                >
                                    <span className="inline-flex text-secondary">
                                        {abstractShow
                                            ? "read less"
                                            : "read more"}
                                    </span>
                                    <ChevronDownIcon
                                        className={`${
                                            abstractShow && "-rotate-180"
                                        } transition duration-300 w-8 h-8 text-secondary`}
                                    />
                                </button>
                            )}
                        </div>

                        {searchableFieldResults.LaySummary && (
                            <div className="grant-lay-summary">
                                <h3>Lay Summary</h3>

                                <div
                                    className="mt-2"
                                    dangerouslySetInnerHTML={{
                                        __html: searchableFieldResults.LaySummary,
                                    }}
                                />
                            </div>
                        )}

                        <KeyFacts grant={grant} />

                        {publicationList?.length > 0 && (
                            <div
                                className="flex flex-col space-y-4"
                                id="paginationTop"
                            >
                                <div className="flex items-baseline gap-x-4">
                                    <h2
                                        className={titleClasses}
                                        id="publications"
                                    >
                                        Publications
                                    </h2>
                                    <p className="text-gray-900 text-sm uppercase">
                                        <span>Last Updated:</span>
                                        <span
                                            className="ml-1"
                                            title={dayjs(
                                                publicationList[0].updated_at
                                            ).toString()}
                                        >
                                            {dayjs(
                                                publicationList[0].updated_at
                                            ).fromNow()}
                                        </span>
                                    </p>
                                </div>

                                <div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {publicationList.map(
                                            (link: any, index: number) => {
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
                                                            onClick={
                                                                handleClick
                                                            }
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
                                                                        activeIndex ===
                                                                            index &&
                                                                        "-rotate-180"
                                                                    } transition duration-300 w-10 h-10`}
                                                                />
                                                            </button>
                                                        </a>

                                                        <AnimateHeight
                                                            duration={300}
                                                            height={
                                                                activeIndex ===
                                                                index
                                                                    ? "auto"
                                                                    : 0
                                                            }
                                                        >
                                                            <ul className="py-6 flex flex-col gap-4">
                                                                <li className="flex flex-col gap-1">
                                                                    <h4 className="text-gray-500 uppercase tracking-wider font-bold text-xs">
                                                                        Authors
                                                                    </h4>
                                                                    <p className="tracking-wider text-tremor-content-emphasis">
                                                                        {
                                                                            link.authorString
                                                                        }
                                                                    </p>
                                                                </li>
                                                                <li className="flex flex-col gap-1">
                                                                    <h4 className="text-gray-500 uppercase tracking-wider font-bold text-xs">
                                                                        Publish
                                                                        Year
                                                                    </h4>
                                                                    <p className="tracking-wider text-tremor-content-emphasis">
                                                                        {
                                                                            link.pubYear
                                                                        }
                                                                    </p>
                                                                </li>
                                                                {link
                                                                    .journalInfo
                                                                    ?.journal
                                                                    ?.title && (
                                                                    <li className="flex flex-col gap-1">
                                                                        <h4 className="text-gray-500 uppercase tracking-wider font-bold text-xs">
                                                                            Journal
                                                                        </h4>
                                                                        <p className="tracking-wider text-tremor-content-emphasis">
                                                                            {
                                                                                link
                                                                                    .journalInfo
                                                                                    .journal
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
                                                                        {
                                                                            link.doi
                                                                        }
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
                                                                    <span>
                                                                        View at
                                                                        Europe
                                                                        PMC
                                                                    </span>
                                                                    <ExternalLinkIcon className="w-5 h-5" />
                                                                </Button>
                                                            </div>
                                                        </AnimateHeight>
                                                    </div>
                                                )
                                            }
                                        )}
                                    </div>

                                    {grant.PubMedLinks?.length > 10 && (
                                        <Pagination
                                            totalPosts={
                                                grant.PubMedLinks?.length
                                            }
                                            postsPerPage={limit}
                                            setLastItemIndex={setLastItemIndex}
                                            setFirstItemIndex={
                                                setFirstItemIndex
                                            }
                                            setActiveIndex={setActiveIndex}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    )
}
