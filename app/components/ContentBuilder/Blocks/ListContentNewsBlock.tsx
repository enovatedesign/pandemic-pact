import BlockWrapper from "../BlockWrapper"
import Image from "next/image";

const NewsCard = ({entry}) => {
    const { title, summary, } = entry
    const thumbnailImage = entry.thumbnailImage[0] ?? null
    console.log(thumbnailImage.alt)
    const classes = [
        'flex flex-col overflow-hidden w-full h-full',
        'transition duration-200',
        'rounded bg-white shadow-lg',
        'hover:shadow-xl hover:scale-105'
    ].join(' ')

    const imageClasses = [
        'block w-full',
        'bg-gray-100',
    ].join(' ')
    
    return (
        <div key={entry.index} className="h-full" >
            <article className={classes}>
                <a href={entry.url}>
                    <Image 
                        src={thumbnailImage.url}
                        alt={thumbnailImage.alt}
                        width={thumbnailImage.width}
                        height={thumbnailImage.height}
                        className='w-full h-full'
                    />
                </a>
                <div className='Flex flex-ol gap-6 p-6 w-full h-full'>
                    {title.length > 0 && (
                        <h3 className='text-xl text-primary uppercase'>
                            {title}
                        </h3>
                    )}
                    {summary.length > 0 && (
                        <p>
                            {summary}
                        </p>
                    )}
                </div>
            </article>
        </div>
    )
};


const ListContentNewsBlock = ( {block} ) => {
    
    const customEntries = block.customEntries ?? null

    return(
        <>
            <BlockWrapper>
                <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {customEntries.map((entry, index) => {
                        return (
                            <>
                                <NewsCard entry={entry} key={index}/>
                            </>
                        )
                    })}
                </ul>
            </BlockWrapper>
        </>
    )
}

export default ListContentNewsBlock