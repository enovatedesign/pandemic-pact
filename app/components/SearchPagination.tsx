'use client'

import { SearchParameters } from '../../../helpers/search'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid'
import { range } from 'lodash'

interface Props {
    searchParameters: SearchParameters
    setSearchParameters: (searchParameters: SearchParameters) => void
    totalHits: number
}

export default function SearchPagination({
    searchParameters,
    setSearchParameters,
    totalHits,
}: Props) {
    const { page, limit } = searchParameters

    const totalPages = Math.ceil(totalHits / limit)

    const changePage = (newPage: number) => {
        setSearchParameters({ ...searchParameters, page: newPage })

        document.getElementById('searchResultsHeading')?.scrollIntoView()
    }

    const maxButtonsToShow = 5

    const firstPageButton = Math.max(1, page - Math.floor(maxButtonsToShow / 2))

    const lastPageButton = Math.min(
        totalPages,
        firstPageButton + maxButtonsToShow - 1
    )

    const pageNumberButtons = range(firstPageButton, lastPageButton + 1)

    const showLeftEllipses = firstPageButton > 1
    const showRightEllipses = lastPageButton < totalPages

    const iconClasses = 'w-8 h-8 border-2 rounded-full'
    const ellipsesClasses = 'flex text-primary space-x-2 text-4xl items-end'

    return (
        <nav aria-label="Pagination">
            <ul className="flex justify-between between pt-6 md:pt-8 xl:pt-20">
                <li>
                    {/* Previous page button */}
                    {page > 1 ? (
                        <button
                            onClick={() => changePage(page - 1)}
                            className="text-secondary uppercase font-bold flex items-center space-x-2 md:space-x-4 disabled:cursor-not-allowed"
                            title="Previous page"
                            aria-label="Go to the previous page"
                        >
                            <ChevronLeftIcon
                                className={`${iconClasses} text-primary border-primary hover:bg-primary hover:text-white transition duration-300`}
                            />
                            <span>Previous</span>
                        </button>
                    ) : (
                        <span className="text-gray-400 uppercase font-bold flex items-center space-x-2 md:space-x-4 disabled:cursor-not-allowed">
                            <ChevronLeftIcon
                                className={`${iconClasses} text-gray-400 border-gray-400 `}
                            />
                            <span>Previous</span>
                        </span>
                    )}
                </li>

                <li>
                    {/* Page number buttons */}
                    <ul className="hidden md:flex md:space-x-4">
                        {showLeftEllipses && (
                            <li className={ellipsesClasses}>…</li>
                        )}

                        {pageNumberButtons.map(number => {
                            const activeButtonClasses = [
                                page === number
                                    ? 'bg-primary text-white'
                                    : 'border-2 border-primary hover:bg-primary text-secondary hover:text-white transition duration-300',
                            ].join(' ')

                            return (
                                <li key={number}>
                                    {page !== number ? (
                                        <button
                                            onClick={() => changePage(number)}
                                            className={`${activeButtonClasses} w-8 rounded-lg flex items-center justify-center aspect-square`}
                                            title={`Go to page ${number}`}
                                            aria-label={`Go to page ${number}`}
                                        >
                                            {number}
                                        </button>
                                    ) : (
                                        <span
                                            aria-label={`You are currently on page ${number}`}
                                            className={`${activeButtonClasses} w-8 rounded-lg flex items-center justify-center aspect-square`}
                                        >
                                            {number}
                                        </span>
                                    )}
                                </li>
                            )
                        })}

                        {showRightEllipses && (
                            <li className={ellipsesClasses}>…</li>
                        )}
                    </ul>
                </li>

                <li>
                    {/* Next page button */}
                    {page < totalPages ? (
                        <button
                            onClick={() => changePage(page + 1)}
                            className="text-secondary uppercase font-bold flex items-center space-x-2 md:space-x-4 disabled:cursor-not-allowed"
                            title="Next page"
                            aria-label="Go to the next page"
                        >
                            <span>Next</span>
                            <ChevronRightIcon
                                className={`${iconClasses} text-primary border-primary hover:bg-primary hover:text-white transition duration-300`}
                            />
                        </button>
                    ) : (
                        <span className="text-gray-400  uppercase font-bold flex items-center space-x-2 md:space-x-4">
                            <span>Next</span>
                            <ChevronRightIcon
                                className={`${iconClasses} text-gray-400 border-gray-400`}
                            />
                        </span>
                    )}
                </li>
            </ul>
        </nav>
    )
}
