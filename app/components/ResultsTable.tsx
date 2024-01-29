'use client'

import '../css/components/results-table.css'
import {SearchResponse, SearchResult} from '../helpers/search'
import {links} from '../helpers/nav'
import {EyeIcon, EyeOffIcon} from '@heroicons/react/solid'
import {useState} from 'react'
import AnimateHeight from 'react-animate-height'
import RichText from './ContentBuilder/Common/RichText'
import Button from './Button'

interface Props {
    searchResponse: SearchResponse
}

export default function ResultsTable({searchResponse}: Props) {
    const [activeIndex, setActiveIndex] = useState(-1)

    return (
        <div>
            <h2 className="text-secondary uppercase tracking-widest text-lg lg:text-xl font-bold">
                Results
            </h2>

            <div className="mt-4 flex flex-col space-y-8 lg:space-y-12 bg-white p-4 md:p-6 lg:p-8 rounded-xl border-2 border-gray-200">
                {searchResponse.hits.map((result, index) => {
                    const query = searchResponse.query

                    const href =
                        `${links.explore.href}/${result._id}` +
                        (query ? `?q=${query}` : '')

                    const data = {index, activeIndex, setActiveIndex}

                    const linkClasses = "hover:underline font-semibold text-base lg:text-2xl"

                    return (
                        <article
                            key={result._id}
                            className="flex flex-col space-y-2 lg:space-y-6"
                        >
                            <h3>
                                {result.highlight?.GrantTitleEng ? (
                                    <a
                                        href={href}
                                        className={linkClasses}
                                        dangerouslySetInnerHTML={{__html: result.highlight.GrantTitleEng[0], }}
                                    ></a>
                                ) : (
                                    <a
                                        href={href}
                                        className={linkClasses}
                                    >
                                        {result._source.GrantTitleEng}
                                    </a>
                                )}

                            </h3>

                            {result.highlight && (
                                <SearchMatches
                                    result={result}
                                    {...data}
                                />
                            )}
                        </article>
                    )
                })}
            </div>
        </div>
    )
}

interface SearchMatchesProps {
    result: SearchResult
    index: number
    activeIndex: number
    setActiveIndex: any
}

function SearchMatches({
    result,
    index,
    activeIndex,
    setActiveIndex,
}: SearchMatchesProps) {
    const countMatches = (highlights: string[]) => {
        return highlights.reduce((total, highlight) => {
            return total + (highlight.match(
                /class="highlighted-search-result-token">/g
            )?.length ?? 0)
        }, 0)
    }

    let matches = [
        {
            label: 'Title',
            count: countMatches(result.highlight.GrantTitleEng ?? []),
        },
        {
            label: 'Abstract',
            count: countMatches(result.highlight.Abstract ?? []),
        },
        {
            label: 'Lay Summary',
            count: countMatches(result.highlight.LaySummary ?? []),
        },
    ]

    matches.push({
        label: 'Total',
        count: matches.reduce((total, {count}) => total + count, 0),
    })

    const titleMatchText = matches
        .filter((label) => label.label === 'Title')
        .filter(({count}) => count > 0)
        .map(({label, count}) => `${count} in ${label}`)

    const abstractMatchText = matches
        .filter((label) => label.label === 'Abstract')
        .filter(({count}) => count > 0)
        .map(({label, count}) => `${count} in ${label}`)

    const totalMatchText = matches
        .filter((label) => label.label === 'Total')
        .filter(({count}) => count > 0)
        .map(({count}) => count)

    const matchText = [titleMatchText, abstractMatchText]

    const iconClasses = 'w-4 h-4 lg:w-6 lg:h-6 text-white'

    const handleClick = () => {
        activeIndex !== index ? setActiveIndex(index) : setActiveIndex(-1)
    }

    const grantAmountConverted =
        typeof result._source.GrantAmountConverted === 'number'
            ? `$ ${result._source.GrantAmountConverted.toLocaleString()}`
            : result._source.GrantAmountConverted

    return (
        <div className="bg-primary/40 p-4 rounded-2xl">
            <div className="grid gap-2 lg:grid-rows-1 lg:grid-cols-4 lg:gap-4 lg:lg:gap-8">
                <div className="flex items-center gap-2 justify-between lg:justify-start row-start-1 row-span-1 lg:row-start-1 lg:col-start-1 lg:col-span-2">
                    <span className="flex gap-x-1 uppercase text-sm lg:text-lg">
                        <span className="hidden md:block">Search</span>
                        Matches:
                    </span>
                    <ul className="flex gap-2">
                        {matchText.filter(text => text.length > 0).map((text, index) => (
                            <li
                                key={index}
                                className="bg-white/60 p-2 md:p-2 rounded-lg whitespace-nowrap text-sm lg:text-md"
                            >
                                {text}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex flex-row items-center  justify-between row-start-2 row-span-1 lg:row-start-1 lg:justify-end lg:col-start-3 lg:col-span-1">
                    <span className="uppercase text-sm lg:text-lg pr-4">
                        Total Matches:
                    </span>
                    <p className="px-4 py-1 bg-searchResult rounded-lg font-bold text-secondary">
                        {totalMatchText}
                    </p>
                </div>

                <div className="row-start-3 row-span-1 lg:row-start-1 lg:col-start-4 lg:col-span-1 flex items-center">
                    <Button
                        onClick={handleClick}
                        size="xsmall"
                        colour="secondary"
                        customClasses="w-full uppercase flex justify-between space-x-2 border-2 border-secondary hover:border-primary transition duration-300"
                    >
                        <span className="inline-flex text-white text-sm lg:text-base whitespace-nowrap">
                            {activeIndex !== index ? 'See more' : 'See less'}
                        </span>
                        {activeIndex !== index ? (
                            <EyeIcon className={iconClasses} />
                        ) : (
                            <EyeOffIcon className={iconClasses} />
                        )}
                    </Button>
                </div>
            </div>

            <AnimateHeight
                duration={300}
                height={activeIndex === index ? 'auto' : 0}
            >
                <div className="grid grid-cols-4 gap-4 lg:gap-8 pt-4">
                    <div className="row-start-2 lg:row-start-1 col-span-4 lg:col-span-3 p-4 bg-white/60 rounded-xl">
                        <p className="pb-2 lg:pb-3 uppercase tracking-widest font-bold text-sm">
                            Abstract Excerpt
                        </p>
                        <RichText
                            text={result.highlight.Abstract[0]}
                            customClasses="max-w-none"
                        />
                    </div>
                    <div className="col-span-4 grid grid-cols-2 gap-4 lg:col-start-4 lg:col-span-1 lg:flex lg:flex-col">
                        <div className="bg-primary text-secondary rounded-xl p-4">
                            <p className="uppercase text-xs tracking-widest font-bold">
                                Amount committed (usd)
                            </p>
                            <p className="text-lg md:text-3xl lg:text-4xl font-bold mt-2">
                                {grantAmountConverted}
                            </p>
                        </div>
                        <div className="bg-primary text-secondary rounded-xl p-4">
                            <p className="uppercase text-xs tracking-widest font-bold">
                                Start Year
                            </p>
                            <p className="text-lg md:text-3xl lg:text-4xl font-bold mt-2">
                                {result._source.GrantStartYear}
                            </p>
                        </div>
                    </div>
                </div>
            </AnimateHeight>
        </div>
    )
}
