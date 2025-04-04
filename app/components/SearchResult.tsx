'use client'

import type { SearchResult } from '../helpers/search'
import { EyeIcon } from '@heroicons/react/solid'
import RichText from './ContentBuilder/Common/RichText'
import Button from './Button'
import { dollarValueFormatter } from '../helpers/value-formatters'
import selectOptions from '../../data/dist/select-options.json'

import '../css/components/highlighted-search-results.css'
import NumberOfPublications from './NumberOfPublications'

interface SearchMatchesProps {
    result: SearchResult
    href: string
}

export default function SearchResult({ result, href }: SearchMatchesProps) {
    const countMatches = (highlights: string[]) => {
        return highlights.reduce((total, highlight) => {
            return (
                total +
                (highlight.match(/class="highlighted-search-result-token">/g)
                    ?.length ?? 0)
            )
        }, 0)
    }

    let matches = [
        {
            label: 'Title',
            count: countMatches(result.highlight?.GrantTitleEng ?? []),
        },
        {
            label: 'Abstract',
            count: countMatches(result.highlight?.Abstract ?? []),
        },
        {
            label: 'Lay Summary',
            count: countMatches(result.highlight?.LaySummary ?? []),
        },
    ]

    matches.push({
        label: 'Total',
        count: matches.reduce((total, { count }) => total + count, 0),
    })

    const titleMatchText = matches
        .filter(label => label.label === 'Title')
        .filter(({ count }) => count > 0)
        .map(({ label, count }) => `${count} in ${label}`)

    const abstractMatchText = matches
        .filter(label => label.label === 'Abstract')
        .filter(({ count }) => count > 0)
        .map(({ label, count }) => `${count} in ${label}`)

    const totalMatchText = matches
        .filter(label => label.label === 'Total')
        .filter(({ count }) => count > 0)
        .map(({ count }) => count)[0]

    const matchText = [titleMatchText, abstractMatchText]

    const iconClasses = 'w-4 h-4 lg:w-6 lg:h-6 text-white'

    const grantAmountConverted =
        typeof result._source.GrantAmountConverted === 'number'
            ? dollarValueFormatter(result._source.GrantAmountConverted)
            : result._source.GrantAmountConverted

    const resultFunders = result._source.FundingOrgName

    const funderNames = resultFunders.map(
        funder =>
            selectOptions.FundingOrgName.find(({ value }) => value === funder)
                ?.label
    )

    const resultFacts = [
        {
            title: 'Amount committed (USD)',
            value: grantAmountConverted,
        },
        {
            title: 'Start Year',
            value: result._source.GrantStartYear,
        },
    ]
    
    const numberOfPublications = result._source.PublicationCount
    
    return (
        <div className="bg-primary/40 p-4 rounded-2xl">
            <div className="grid gap-2 lg:grid-rows-1 lg:grid-cols-12 lg:gap-8">
                <div className="w-full flex flex-col lg:flex-row lg:items-center gap-2 justify-between lg:col-span-9">
                    {funderNames && (
                        <p className="truncate">
                            <span className="font-bold">Funders:</span>{' '}
                            {funderNames.join(', ')}
                        </p>
                    )}
                    <div className="flex justify-between gap-x-2">
                        {totalMatchText > 0 && (
                            <div className="flex items-center gap-x-2">
                                <p className="inline-flex gap-1">
                                    <span className="hidden md:block">Search</span>
                                    Matches:
                                </p>
                                <span className="px-2 lg:px-4 py-1 bg-searchResult rounded-lg font-bold text-secondary text-sm md:text-base">
                                    {totalMatchText}
                                </span>
                                <p className="bg-white/60 p-2 rounded-lg whitespace-nowrap text-xs lg:text-md">
                                    {matchText.map((text, index: number) => {
                                        const formattedText =
                                            index !== matchText.length - 1 &&
                                            text.length > 0
                                                ? `${text}, `
                                                : text

                                        return <span key={index}>{formattedText}</span>
                                    })}
                                </p>
                            </div>
                        )}

                        <NumberOfPublications numberOfPublications={numberOfPublications} href={href} />
                    </div>
                </div>

                <div className="row-span-1 lg:row-start-1 lg:col-start-10 lg:col-span-3 flex items-center">
                    <Button
                        href={href}
                        size="xsmall"
                        colour="secondary"
                        customClasses="w-full uppercase flex justify-between space-x-2 border-2 border-secondary hover:border-primary transition duration-300"
                    >
                        <span className="inline-flex text-white text-sm lg:text-base whitespace-nowrap">
                            See Full Grant Record
                        </span>
                        <EyeIcon className={iconClasses} />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 lg:gap-8 pt-4">
                <div className="row-start-2 lg:row-start-1 col-span-4 lg:col-span-3 p-4 bg-white/60 rounded-xl">
                    <h4 className="pb-2 lg:pb-3 uppercase tracking-widest font-bold text-sm">
                        Abstract{' '}
                        {result.highlight?.Abstract?.length > 1 && 'Excerpt'}
                    </h4>

                    {result.highlight?.Abstract?.length > 1 ? (
                        <RichText
                            text={
                                '&#8230; ' +
                                result.highlight.Abstract.join(' &#8230; ') +
                                ' &#8230;'
                            }
                            customClasses="max-w-none"
                        />
                    ) : (
                        <p className="line-clamp-6">
                            {result._source.Abstract}
                        </p>
                    )}
                </div>

                <ul className="col-span-4 flex gap-4 lg:col-start-4 lg:col-span-1 lg:flex-col">
                    {resultFacts
                        .filter(fact => fact.value)
                        .map((fact, index: number) => (
                            <li key={index} className="w-full">
                                <p className="h-full flex flex-col justify-between bg-primary text-secondary rounded-xl p-4">
                                    <span className="uppercase text-xs tracking-widest font-bold">
                                        {fact.title}
                                        <span className="sr-only">:</span>
                                    </span>{' '}
                                    <span className="text-lg md:text-3xl lg:text-4xl font-bold mt-2">
                                        {fact.value}
                                    </span>
                                </p>
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    )
}
