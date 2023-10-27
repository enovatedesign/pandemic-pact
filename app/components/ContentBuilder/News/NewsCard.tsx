import Image from "next/image";
import NewsTags from "./NewsTags";

const NewsCard = ({entry, tags}) => {
    const { title, summary, } = entry
    const thumbnailImage = entry.thumbnailImage[0] ?? null

    const classes = [
        'flex flex-col overflow-hidden w-full h-full',
        'transition duration-200',
        'rounded bg-white shadow-lg',
        'hover:shadow-xl hover:scale-105'
    ].join(' ')

    const imageClasses = [
        'block w-full h-full',
        'bg-gray-100',
    ].join(' ')
    console.log('url is', thumbnailImage.url)
    return (
        <div key={entry.index} className="h-full">
            <article className={classes}>
                <a href={entry.url}>
                    <Image 
                        src={thumbnailImage.url}
                        alt={thumbnailImage.alt}
                        width={thumbnailImage.width}
                        height={thumbnailImage.height}
                        className={imageClasses}
                        loading="lazy"
                    />
                </a>
                <div className='flex flex-col gap-6 p-6 w-full h-full'>
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
                    {tags && (
                        <NewsTags />
                    )}
                </div>
            </article>
        </div>
    )
};

export default NewsCard