import Image from "next/image";
import NewsTags from "../News/NewsTags";
import RichText from "./RichText";

type Props = {
    entry: any,
    tags?: boolean, 
    children: any,
    image?: {
        altText: string,
        url: string, 
        width: number,
        height: number,
    },
    hover?: boolean,
}

const Card = ({entry, tags = false, children, image, hover = true}: Props) => {
    
    const { 
        title, 
        postNominalLetters, 
        jobTitle,
        summary, 
        index, 
        url,
        externalLink,
        text,
    } = entry

    const cardImage = entry.thumbnailImage ? entry.thumbnailImage[0] : image 

    const hoverClasses = [
        hover ? 'hover:shadow-lg hover:scale-105 transition duration-300' : ''
    ].join(' ')

    return (
        <div key={index} 
            className={`${hoverClasses} flex flex-col bg-white border-2 border-gray-200  rounded-2xl overflow-hidden`}
        >   
            {url || externalLink ? (
                <a href={url || externalLink}>
                    {cardImage?.url && (
                        <Image 
                            src={cardImage.url}
                            alt={cardImage.altText}
                            width={cardImage.width}
                            height={cardImage.height}
                            className="w-full"
                            loading="lazy"
                        />
                    )}
                </a>                
            ) : (
                <>
                    {cardImage?.url && (
                        <Image 
                            src={cardImage.url}
                            alt={cardImage.altText}
                            width={cardImage.width}
                            height={cardImage.height}
                            className="w-full"
                            loading="lazy"
                        />
                    )}
                </>
            )}
            
            <div className="flex flex-col gap-3 p-6 h-full">
                
                {title && (
                    <h3 className="text-xl md:text-2xl">
                        {title}
                        {postNominalLetters && (<span className="block text-base text-gray-500">{postNominalLetters}</span>)}
                    </h3>
                )}
                
                {jobTitle && (
                    <p className="text-lg font-bold">
                        {jobTitle}
                    </p>
                )}
                
                {summary && (
                    <p>
                        {summary}
                    </p>
                )}

                {text && (
                    <RichText text={text} customClasses='' invert={false} typeScale={""}/>
                )}

                <p className="mt-auto self-end">
                    {children && (
                        <>
                            {children}
                        </>
                    )}
                </p>
                
                {tags && (
                    <NewsTags />
                )}

            </div>
            
        </div>
    )
};

export default Card