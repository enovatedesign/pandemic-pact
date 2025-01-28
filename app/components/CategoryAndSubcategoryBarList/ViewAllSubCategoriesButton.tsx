interface ViewSubCategoryButtonProps {
    topOfCardId: string
    label: string
    subCategoryValue: string
    setSelectedCategory: (category: string) => void
    customClasses?: string
}

const ViewSubCategoryButton = ({
    topOfCardId,
    label,
    subCategoryValue,
    setSelectedCategory,
    customClasses,
}: ViewSubCategoryButtonProps) => {
    const handleClick = () => {
        location.href = `#${topOfCardId}`

        setSelectedCategory(subCategoryValue)
    }

    return (
        <button
            className={`self-start text-center font-medium rounded-full no-underline transition-colors duration-200 ease-in-out disabled:bg-disabled disabled:cursor-default disabled:hover:bg-disabled text-sm ${
                customClasses
                    ? customClasses
                    : 'px-3 bg-primary hover:bg-primary-lighter text-secondary'
            } ignore-in-image-export`}
            onClick={handleClick}
        >
            {label}
        </button>
    )
}

export default ViewSubCategoryButton