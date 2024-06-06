'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid'
import { range } from 'lodash'

interface Props {
    page: number
    setPage: (value: number) => void
    totalHits: number
    limit: number
}

export default function SearchPagination({
    page,
    setPage,
    totalHits,
    limit,
}: Props) {
    const totalPages = Math.ceil(totalHits / limit)

    const changePage = (newPage: number) => {
        setPage(newPage)
        document.getElementById('searchResultsHeading')?.scrollIntoView()
    }

    const iconClasses = 'w-8 h-8 border-2 rounded-full'
    const ellipsesClasses = 'flex text-primary space-x-2 text-4xl items-end'

    // TODO name this better
    const leftEllipsesClasses = page >= 4
    const rightEllipsesClasses = page < totalPages - 2

    const firstPageButton = totalPages > 3 && page > 3 ? page - 3 : 1
    const lastPageButton = totalPages > 3 && page > 3 ? page + 2 : 5
    const pageNumberButtons = range(firstPageButton, lastPageButton)

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
                        {leftEllipsesClasses && (
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

                        {rightEllipsesClasses && (
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

