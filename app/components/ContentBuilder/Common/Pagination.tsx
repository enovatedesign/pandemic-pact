"use client"
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid"

const Pagination = ({
    postsPerPage, 
    totalPosts, 
    setCurrentPage,
    currentPage
}) => {

    const pageNumbers = []

    for (let i=1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
        pageNumbers.push(i)
    }

    const filteredPageNumbers = pageNumbers.length > 3 ? pageNumbers.slice(currentPage-1, currentPage +3) : pageNumbers

    const handlePrev = () => {
        if (currentPage === 1) {
            setCurrentPage(pageNumbers.length)
        } else {
            setCurrentPage(currentPage -1)
        }
    }

    const handleNext = () => {
        if (currentPage === pageNumbers.length) {
            setCurrentPage(1)
        } else {
            setCurrentPage(currentPage +1)
        }
    }

    const iconClasses = 'w-8 h-8 text-primary transition duration-300 border-2 border-primary rounded-full hover:bg-primary hover:text-white'

    return (
        <div className="flex justify-between between pt-20">
            <div className="flex items-center space-x-4">
                <button onClick={handlePrev} className={iconClasses} >
                    <ChevronLeftIcon className='-translate-x-[1px]'/>
                </button>
                <span  className="hidden md:block text-secondary uppercase font-bold">
                    Previous
                </span>
            </div>
            <div className="flex space-x-8">
                {filteredPageNumbers.map((number, index) => {

                    const activeButtonClasses = [
                        currentPage === number ? "bg-primary text-white" :  "border-2 border-primary hover:bg-primary text-secondary hover:text-white transition duration-300"
                    ].join(' ')

                    return (
                        <>  
                            <button key={index} onClick={() => setCurrentPage(number)} className={`${activeButtonClasses} w-8 rounded-lg flex items-center justify-center aspect-square`}>
                                {number}
                            </button>
                        </>
                    )
                })}
            </div>
            <div className="flex items-center space-x-4">
                <span  className="hidden md:block text-secondary uppercase font-bold">
                    Next
                </span>    
                <button onClick={handleNext} className={iconClasses}>
                    <ChevronRightIcon className='translate-x-[1px]' />
                </button>
            </div>
        </div>

    )
}

export default Pagination