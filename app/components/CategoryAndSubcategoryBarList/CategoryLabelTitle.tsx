import { useEffect, useRef, useState } from "react"
import InfoModal from "../InfoModal"

const CategoryLabelTitle = ({ 
    title, 
    categoryDescription 
} : { 
    title: string, 
    categoryDescription?: string 
}) => {
    const [canExpand, setCanExpand] = useState<boolean>(false)
    const [isExpanded, setIsExpanded] = useState<boolean>(false)

    const titleRef = useRef<HTMLParagraphElement>(null)

    useEffect(() => {
        if (titleRef) {
            const clientHeight = titleRef.current?.clientHeight ?? 0
            const scrollHeight = titleRef.current?.scrollHeight ?? 0

            setCanExpand(scrollHeight > clientHeight)
        }
    }, [titleRef])

    return (
        <div className="w-full flex items-start justify-between gap-x-2">
            <p ref={titleRef} className={`bar-chart-category-label text-gray-600 text-sm line-clamp-1 ${isExpanded ? '!line-clamp-none' : ''}`}>
                {title} 
                {categoryDescription && (
                    <InfoModal customButtonClasses="ml-1" iconSize="size-4">
                        {categoryDescription}
                    </InfoModal>
                )}
            </p> 
            
            {canExpand && (    
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="hidden lg:block  lg:text-secondary lg:text-sm lg:whitespace-nowrap"
                >
                    {!isExpanded ? 'Expand Title' : 'Hide Title'}
                </button>
            )}
        </div>
    )
}

export default CategoryLabelTitle