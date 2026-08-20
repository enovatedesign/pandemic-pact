'use client'

import Link from 'next/link'
import { ExternalLinkIcon, EyeIcon } from '@heroicons/react/solid'

import ItemsPerPageSelect from '../../components/ItemsPerPageSelect'
import Button from '../../components/Button'
import { useSelectOptions } from '../visualise/visualisations/useSelectOptions'
import { buildIctrpUrl } from '../ictrp'
import { CtSearchParameters, CtSearchResponse, CtSearchResult } from './search'

import '../../css/components/highlighted-search-results.css'

interface Props {
    searchParameters: CtSearchParameters
    setSearchParameters: (searchParameters: Partial<CtSearchParameters>) => void
    searchResponse: CtSearchResponse
}

export default function ClinicalTrialsResultsTable({
    searchParameters,
    setSearchParameters,
    searchResponse,
}: Props) {
    const diseaseLabels = useSelectOptions('Diseases')
    const registerLabels = useSelectOptions('Register')

    const setLimit = (limit: number) => {
        setSearchParameters({ limit })
    }

    return (
        <div>
            <div className="w-full flex items-center justify-between">
                <h2
                    id="searchResultsHeading"
                    className="text-secondary uppercase tracking-widest text-lg lg:text-xl font-bold"
                >
                    Results
                </h2>

                <ItemsPerPageSelect
                    limit={searchParameters.limit}
                    setLimit={setLimit}
                />
            </div>

            <div className="mt-4 flex flex-col space-y-8 lg:space-y-12 bg-white p-4 md:p-6 lg:p-8 rounded-xl border-2 border-gray-200">
                {searchResponse.hits.map((result: CtSearchResult, index: number) => {
                    const resultIndex = searchParameters.page
                        ? (searchParameters.page - 1) * searchParameters.limit +
                          1 +
                          index
                        : index + 1

                    const titleHtml =
                        result.highlight?.TrialTitle?.[0] ??
                        result.highlight?.TrialTitleScientific?.[0] ??
                        result.highlight?.TrialTitlePublic?.[0]

                    const title = result._source.TrialTitle

                    const detailHref =
                        `/clinical-trials/${result._id}` +
                        (searchParameters.q ? `?q=${searchParameters.q}` : '')

                    return (
                        <article
                            key={result._id}
                            className="flex flex-col space-y-2 lg:space-y-6"
                        >
                            <h3 className="flex gap-2 items-start">
                                <span className="block text-gray-500 font-semibold lg:text-2xl">
                                    {resultIndex}.
                                </span>{' '}
                                {titleHtml ? (
                                    <Link
                                        href={detailHref}
                                        className="underline decoration-primary hover:decoration-secondary font-semibold lg:text-2xl text-secondary"
                                        dangerouslySetInnerHTML={{ __html: titleHtml }}
                                    />
                                ) : (
                                    <Link
                                        href={detailHref}
                                        className="underline decoration-primary hover:decoration-secondary font-semibold lg:text-2xl text-secondary"
                                    >
                                        {title}
                                    </Link>
                                )}
                            </h3>

                            <ClinicalTrialResult
                                result={result}
                                detailHref={detailHref}
                                diseaseLabels={diseaseLabels}
                                registerLabels={registerLabels}
                            />
                        </article>
                    )
                })}
            </div>
        </div>
    )
}

type LabelMap = Record<string, string>

function ClinicalTrialResult({
    result,
    detailHref,
    diseaseLabels,
    registerLabels,
}: {
    result: CtSearchResult
    detailHref: string
    diseaseLabels: LabelMap
    registerLabels: LabelMap
}) {
    const { _source } = result

    const diseases = (_source.Diseases ?? [])
        .map(code => diseaseLabels[code] ?? code)
        .join(', ')

    const register = registerLabels[_source.Register] ?? _source.Register

    const hasSourceLink =
        Boolean(_source.SourceLink) && _source.SourceLink !== 'N/A'

    const registrationYear = _source.RegistrationYear

    const trialNumber = _source.TrialNumber

    // Mirror the grants "Search Matches" counter. Only the title fields are
    // highlighted for trials, and the variants (default/scientific/public)
    // overlap, so count the first available one to avoid inflating the total.
    const titleHighlights =
        result.highlight?.TrialTitle ??
        result.highlight?.TrialTitleScientific ??
        result.highlight?.TrialTitlePublic ??
        []

    const matchCount = titleHighlights.reduce(
        (total, highlight) =>
            total +
            (highlight.match(/class="highlighted-search-result-token">/g)
                ?.length ?? 0),
        0,
    )

    return (
        <div className="bg-primary/40 p-4 rounded-2xl flex flex-col gap-4">
            <div className="grid gap-4 lg:grid-cols-12 lg:gap-8">
                <div className="lg:col-span-9 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        {register && (
                            <>
                                <span>
                                    <span className="font-bold">Registry:</span>{' '}
                                    {register}
                                </span>

                                {hasSourceLink && (
                                    <a
                                        href={_source.SourceLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="z-10 inline-flex items-center gap-1 bg-primary px-2.5 rounded-lg tracking-wider font-bold py-0.5 text-sm uppercase text-secondary whitespace-nowrap hover:bg-secondary hover:text-white transition duration-300"
                                    >
                                        View Original Registration
                                        <ExternalLinkIcon className="w-4 h-4" />
                                    </a>
                                )}
                            </>
                        )}
                    </div>

                    {matchCount > 0 && (
                        <div className="flex items-center gap-x-2">
                            <p className="inline-flex gap-1 whitespace-nowrap">
                                <span className="hidden md:block">Search</span>
                                Matches:
                            </p>
                            <span className="px-2 lg:px-4 py-1 bg-searchResult rounded-lg font-bold text-secondary text-sm md:text-base">
                                {matchCount}
                            </span>
                        </div>
                    )}
                </div>

                <div className="lg:col-start-10 lg:col-span-3 flex items-start">
                    <Button
                        href={detailHref}
                        size="xsmall"
                        colour="secondary"
                        customClasses="w-full uppercase flex justify-between space-x-2 border-2 border-secondary hover:border-primary transition duration-300"
                    >
                        <span className="inline-flex text-white text-sm lg:text-base whitespace-nowrap">
                            View Full Record
                        </span>
                        <EyeIcon className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                    </Button>
                </div>
            </div>

            {(diseases || trialNumber || registrationYear) && (
                <div className="grid gap-4 lg:grid-cols-12 lg:gap-8">
                    <div className="lg:col-span-6 lg:-mr-4">
                        <p className="h-full flex flex-col justify-between bg-white/60 text-secondary rounded-xl p-4">
                            <span className="uppercase text-xs tracking-widest font-bold">
                                Disease(s)<span className="sr-only">:</span>
                            </span>{' '}
                            <span className="text-lg lg:text-xl font-bold mt-2">
                                {diseases || '-'}
                            </span>
                        </p>
                    </div>

                    {trialNumber && (
                        <div className="lg:col-span-3">
                            <p className="h-full flex flex-col justify-between bg-white/60 text-secondary rounded-xl p-4">
                                <span className="uppercase text-xs tracking-widest font-bold">
                                    ICTRP link<span className="sr-only">:</span>
                                </span>{' '}
                                <a
                                    href={buildIctrpUrl(trialNumber)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 flex items-start gap-1 text-base md:text-lg font-bold underline decoration-primary hover:decoration-secondary"
                                >
                                    <span className="break-all">{trialNumber}</span>
                                    <ExternalLinkIcon className="w-4 h-4 shrink-0" />
                                </a>
                            </p>
                        </div>
                    )}

                    {registrationYear && (
                        <div className="order-first lg:order-none lg:col-start-10 lg:col-span-3">
                            <p className="h-full flex flex-col justify-between bg-primary text-secondary rounded-xl p-4">
                                <span className="uppercase text-xs tracking-widest font-bold">
                                    Registration Year<span className="sr-only">:</span>
                                </span>{' '}
                                <span className="text-lg md:text-3xl lg:text-4xl font-bold mt-2">
                                    {registrationYear}
                                </span>
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
