
"use client"
import {useState, useEffect} from "react"
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {ChevronLeftIcon, ChevronRightIcon} from "@heroicons/react/solid"

interface Props {
    postsPerPage: number,
    totalPosts: number,
    setFirstItemIndex: ((index: number) => void)
    setLastItemIndex: ((index: number) => void)
}

const SearchPagination  = ({
    postsPerPage,
    totalPosts,
    setFirstItemIndex,
    setLastItemIndex,
}: Props) => {
    
    const router = useRouter()
    const pathName = usePathname()
    const params = useSearchParams()
    const pageParam = params.get('page')

    const [page, setPage] = useState(pageParam ? Number(pageParam) : 1)
    const totalPages = Array.from({length: (Math.ceil(totalPosts / postsPerPage))}, (_, i) => i + 1)
    const filteredPages = (totalPages.length > 3 && page > 3) ? totalPages.slice(page - 3, page + 2) : totalPages.splice(0, 5)

    useEffect(() => {
        const newPageParam = params.get('page')
        if (!newPageParam && page !== 1) {
            setPage(1)
        } else if (newPageParam && newPageParam !== page.toString()) {
            setPage(Number(newPageParam))
        }

        const lastItemIndex = page * postsPerPage
        setFirstItemIndex(lastItemIndex - postsPerPage)
        setLastItemIndex(lastItemIndex)
    }, [page, postsPerPage, setFirstItemIndex, setLastItemIndex, params])

    const updateSearchParams = (number: number) => {
        const newParams = new URLSearchParams(params.toString())
        newParams.set('page', number.toString())

        const url = number !== 1 ? `${pathName}?${newParams.toString()}` : pathName
        router.push(url, { scroll: false })
    }

    const updatePage = (number: number) => {
        setPage(number)
        updateSearchParams(number)
    }
    
    const handleChange = (target: number) => {
        updatePage(target)
        window.location.hash = "#paginationTop"
    }

    const iconClasses = 'w-8 h-8 border-2 rounded-full'

    const ellipsesClasses = 'flex text-primary space-x-2 text-4xl items-end'
    const leftEllipsesClasses = (page >= 4)
    const rightEllipsesClasses = (page < (totalPages.length - 2))

    return (
        <nav aria-label="Pagination">

            <ul className="flex justify-between between pt-6 md:pt-8 xl:pt-20">
                <li>

                    {/* Previous page button */}
                    {page !== 1 ? (
                        <button
                            onClick={() => handleChange(page-1)}
                            className={`${page === 1 ? 'text-gray-400' : 'text-secondary'} uppercase font-bold flex items-center space-x-2 md:space-x-4 disabled:cursor-not-allowed`}
                            disabled={page === 1}
                            title='Previous page' aria-hidden={page === 1} aria-label={`Go to the previous page`}
                        >
                            <ChevronLeftIcon className={`${iconClasses} ${page === 1 ? 'text-gray-400 border-gray-400' : 'text-primary border-primary hover:bg-primary hover:text-white' } transition duration-300`}/>
                            <span>Previous</span>
                        </button>
                    ): (
                        <span
                            className="text-gray-400 uppercase font-bold flex items-center space-x-2 md:space-x-4 disabled:cursor-not-allowed"
                        >
                            <ChevronLeftIcon className={`${iconClasses} text-gray-400 border-gray-400 `}/>
                            <span>Previous</span>
                        </span>
                    )}

                </li>
                <li>

                    {/* Page number buttons */}
                    <ul className="hidden md:flex md:space-x-4">

                        {leftEllipsesClasses && (<li className={ellipsesClasses}>…</li>)}

                        {filteredPages.map(number => {
                            
                            const activeButtonClasses = [
                                page === number ? "bg-primary text-white" : "border-2 border-primary hover:bg-primary text-secondary hover:text-white transition duration-300"
                            ].join(' ')

                            return (
                                <li key={number}>
                                    {page !== number ? (
                                        <button
                                            onClick={() => handleChange(number)}
                                            className={`${activeButtonClasses} w-8 rounded-lg flex items-center justify-center aspect-square`}
                                            title={`Go to page ${number}`} aria-label={`Go to page ${number}`}
                                        >
                                            {number}
                                        </button>
                                    ) : (   
                                        <span aria-label={`You are currently on page ${number}`} className={`${activeButtonClasses} w-8 rounded-lg flex items-center justify-center aspect-square`}>
                                            {number}
                                        </span>
                                    )}
                                </li>
                            )
                        })}

                        {rightEllipsesClasses && (<li className={ellipsesClasses}>…</li>)}

                    </ul>

                </li>
                <li>

                    {/* Next page button */}
                    {page !== totalPages.length ? (
                        <button
                            onClick={() => handleChange(page + 1)}
                            className={`${page === totalPages.length ? 'text-gray-400' : 'text-secondary'}  uppercase font-bold flex items-center space-x-2 md:space-x-4 disabled:cursor-not-allowed`}
                            disabled={page === totalPages.length}
                            title='Next page' aria-hidden={page === totalPages.length} aria-label={`Go to the next page`}
                        >
                            <span>Next</span>
                            <ChevronRightIcon className={`${iconClasses} ${page === totalPages.length ? 'text-gray-400 border-gray-400' : 'text-primary border-primary hover:bg-primary hover:text-white' } transition duration-300`}/>
                        </button>
                    ) : (
                        <span className="text-gray-400  uppercase font-bold flex items-center space-x-2 md:space-x-4">
                            <span>Next</span>
                            <ChevronRightIcon className={`${iconClasses} text-gray-400 border-gray-400`}/>
                        </span>
                    )}

                </li>
            </ul>
            
        </nav>
    )
}

export default SearchPagination