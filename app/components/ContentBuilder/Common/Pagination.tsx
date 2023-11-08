"use client"
import { useRef, useState, useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid"

const Pagination = ({
    postsPerPage, 
    totalPosts, 
    setFirstItemIndex,
    setLastItemIndex,
}) => {
    
    const router = useRouter()
    const pathName = usePathname()
    const params = useSearchParams()
    const pageParam = params.get('page')

    const [page, setPage] = useState(pageParam ? Number(pageParam) : 1)
    const totalPages = Array.from({length: (Math.ceil(totalPosts / postsPerPage))}, (_, i) => i + 1)
    const filteredPages = (totalPages.length > 3 && page > 3) ? totalPages.slice(page-3, page+2 ) : totalPages.splice(0,5)

    useEffect(() => {
        const newPageParam = params.get('page')
        if (!newPageParam && page !== 1 ) {
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
        router.push(url, { shallow: true })
    }
    
    const updatePage = (number: number) => {
        setPage(number)
        updateSearchParams(number)
    }
    
    const iconClasses = 'w-8 h-8 text-primary transition duration-300 border-2 border-primary rounded-full hover:bg-primary hover:text-white '
    
    const leftFullStopClasses = [
        page >= 4 ? 'block' : 'invisible'
    ].join(' ')

    const rightFullStopClasses = [
        page < totalPages.length -2 ? 'block' : 'hidden'
    ].join(' ')

    return (
        <div className="flex justify-between between pt-6 md:pt-8 xl:pt-20">
            <button 
                onClick={() => updatePage(page - 1)}
                disabled={page === 1}
                className="flex items-center space-x-4 disabled:cursor-not-allowed"
            >   
                <p className={iconClasses}>
                    <ChevronLeftIcon className='-translate-x-[1px]'/>
                </p>
                <span className="hidden md:block text-secondary uppercase font-bold">
                    Previous
                </span>
            </button>

            <div className="flex space-x-2 md:space-x-4 lg:space-x-6 xl-space-x-8">
                <p className={`${leftFullStopClasses} hidden md:flex text-primary space-x-2 text-4xl items-end`}>
                    <span>.</span><span>.</span><span>.</span>
                </p>
                <div className="hidden md:block">
                    {filteredPages.map(number => {
                        const activeButtonClasses = [
                            page === number ? "bg-primary text-white" :  "border-2 border-primary hover:bg-primary text-secondary hover:text-white transition duration-300"
                        ].join(' ')

                        return (
                            <>  
                                <button key={number} onClick={() => updatePage(number)} className={`${activeButtonClasses} w-8 rounded-lg flex items-center justify-center aspect-square`}>
                                    {number}
                                </button>
                            </>
                        )
                    })}
                </div>
                <p className={`${rightFullStopClasses} hidden md:flex text-primary space-x-2 text-4xl items-end`}>
                    <span>.</span><span>.</span><span>.</span>
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
                <p className={iconClasses}>
                    <ChevronRightIcon className="translate-x-[1px]" />
                </p>    
            </button>
        </div>

    )
}

export default Pagination