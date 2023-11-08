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

    return (
        <div className="flex justify-between between pt-20">
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

            {/* {totalPages.length > 5 && (
                <div className="flex items-center space-x-4">
                    <button onClick={() => setPage(1)}>
                        <span  className="hidden md:block text-secondary uppercase font-bold">
                            1
                        </span>
                    </button>
                </div>
            )} */}

            <div className="flex space-x-8">
                {totalPages.map(number => {
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
            
            {/* {totalPages.length > 5 && (
                <div className="flex items-center space-x-4">
                    <button onClick={() => setCurrentPage(totalPages.length)}>
                        <span  className="hidden md:block text-secondary uppercase font-bold">
                            {totalPages.length}
                        </span>
                    </button>
                </div>
            )} */}

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