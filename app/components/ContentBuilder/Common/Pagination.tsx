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

const Pagination = ({
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

    const iconClasses = 'w-8 h-8 transition duration-300 border-2 rounded-full'

    const leftFullStopClasses = [
        page >= 4 ? 'block' : 'invisible'
    ].join(' ')

    const rightFullStopClasses = [
        page < totalPages.length - 2 ? 'block' : 'invisible'
    ].join(' ')

    return (
        <div className="flex justify-between between pt-6 md:pt-8 xl:pt-20">
            <button
                onClick={() => updatePage(page - 1)}
                disabled={page === 1 ? true : false}
                className="flex items-center space-x-4 disabled:cursor-not-allowed"
            >
                <p className={`${iconClasses} ${page === 1 ? 'border-gray-400 text-gray' : 'border-primary text-primary hover:bg-primary hover:text-white'}`}>
                    {page === 1 ? (
                        <p>
                            <ChevronLeftIcon className='text-gray-400 -translate-x-[1px]'/>
                        </p>        
                    ) : (
                        <a href="#paginationTop">
                            <ChevronLeftIcon className='text-primary -translate-x-[1px] hover:text-white transition duration-300'/>
                        </a>
                    )}
                </p>
                <span className={`${page === 1 ? 'text-gray-400' : 'text-secondary'} hidden md:block  uppercase font-bold`}>
                    Previous
                </span>
            </button>

            <div className="flex space-x-2 md:space-x-4 lg:space-x-6 xl-space-x-8">
                <p className={`${leftFullStopClasses} hidden md:flex text-primary space-x-2 text-4xl items-end`}>
                    …
                </p>
                <div className="hidden md:flex md:space-x-4 ">
                    {filteredPages.map(number => {
                        const activeButtonClasses = [
                            page === number ? "bg-primary text-white" : "border-2 border-primary hover:bg-primary text-secondary hover:text-white transition duration-300"
                        ].join(' ')

                        return (
                            <>
                                <a href="#paginationTop">
                                    <button key={number} onClick={() => updatePage(number)} className={`${activeButtonClasses} w-8 rounded-lg flex items-center justify-center aspect-square`}>
                                        {number}
                                    </button>
                                </a>
                            </>
                        )
                    })}
                </div>
                <p className={`${rightFullStopClasses} hidden md:flex text-primary space-x-2 text-4xl items-end`}>
                    …
                </p>
            </div>


            <button
                onClick={() => updatePage(page + 1)}
                disabled={page === totalPages.length}
                className="flex items-center space-x-4 disabled:cursor-not-allowed"
            >
                <span className="hidden md:block text-secondary uppercase font-bold">
                    Next
                </span>
                <p className={`${iconClasses} ${page === totalPages.length ? 'border-gray-400 text-gray' : 'border-primary text-primary hover:bg-primary hover:text-white'}`}>
                    {page === totalPages.length ? (
                        <p>
                            <ChevronRightIcon className='text-gray-400 translate-x-[1px]'/>
                        </p>        
                    ) : (
                        <a href="#paginationTop">
                            <ChevronRightIcon className='text-primary translate-x-[1px] hover:text-white transition duration-300'/>
                        </a>
                    )}
                </p>
            </button>
        </div>

    )
}

export default Pagination
