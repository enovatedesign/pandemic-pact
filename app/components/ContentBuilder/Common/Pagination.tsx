"use client"

const Pagination = ({postsPerPage, totalPosts, handlePagination, currentPage}) => {

    const pageNumbers = []


    for (let i=1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
        pageNumbers.push(i)
    }

    return (
        <div className="flex justify-center space-x-20 pt-20">
            {pageNumbers.map((number, index) => {

                const buttonClasses = [
                    "w-12 text-xl rounded-lg flex items-center justify-center aspect-square",
                    currentPage === number ? "bg-primary text-white" : "border-2 border-primary hover:bg-primary text-primary hover:text-white transition duration-300"
                ].join(' ')
                
                return (
                    <>  
                        <button key={index} onClick={() => handlePagination(number)} className={`${buttonClasses}`}>
                            {number}
                        </button>
                    </>
                )
            })}
        </div>

    )
}

export default Pagination