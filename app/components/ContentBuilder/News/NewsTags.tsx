import { TagIcon } from "@heroicons/react/solid"

const NewsTags = () => {
    
    const tags = [
        {
            title: 'test',
            url: '#'
        }
    ]

    return(
        <article className="flex flex-col lg:flex-row lg:content-center lg:justify-center lg:items-center">
            <ul className="flex flex-nowrap flex-col gap-2 sm:flex-wrap sm:flex-row sm:justify-center">
                
                {tags.map((tag, index) => {
                    const tagClasses = [
                        'flex items-center',
                        'rounded-full px-3 py-2',
                        'transition duration-200',
                        'text-sm',
                        'text-gray-700 bg-gray-200 hover:bg-gray-100'
                    ].join(' ') 

                    const iconClasses = 'w-8 h-8 text-primary transition duration-300 mr-1'

                    return(
                        <li key={index}>
                            <a href={tag.url} className={tagClasses}>
                                <TagIcon className={iconClasses}/>
                                    {tag.title}
                            </a>
                        </li>
                    )
                })}
                
            </ul>
        </article>

    )
}
export default NewsTags