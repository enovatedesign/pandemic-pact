import Image from "next/image"
import NewsTags from "../News/NewsTags"
import RichText from "./RichText"
import { useInView, animated } from '@react-spring/web'
import ConditionalWrapper from "../../ConditionalWrapper"
import { Fragment } from "react"
import dayjs from 'dayjs'

type Props = {
    entry: any,
    tags?: boolean, 
    animatedIcon?: React.ReactNode,
    cardBottomContent?: React.ReactNode
    image?: {
        altText: string,
        url: string, 
        width: number,
        height: number,
    },
    hover?: boolean,
    customImageClasses?: string,
    fallbackImageAspectRatio?: string
}

const CardBottomContent = ({ cardBottomContent }: { cardBottomContent?: React.ReactNode }) => {
    return (
        <>  
            {cardBottomContent}
        </>
    )
}

const Card = ({
    entry, 
    tags = false, 
    animatedIcon, 
    cardBottomContent, 
    image, 
    customImageClasses = "w-full",
    fallbackImageAspectRatio = "aspect-[16/10]"
}: Props) => {
    const {
        index,
        title,
        titleSuffix,
        imageLabel,
        summary,
        text,
        summaryClasses,
        url,
        thumbnailImage,
        postDate,
    } = entry

    const cardImage = thumbnailImage ? thumbnailImage[0] : image

    const externalUrl = url?.startsWith('http')
    const targetAttr = externalUrl ? '_blank' : undefined
    const relAttr = externalUrl ? 'nofollow noopener noreferrer' : undefined

    const hoverClasses = [
        url ? 'hover:shadow-lg transition-shadow duration-300' : ''
    ].join(' ')

    const [ref, springs] = useInView(
        () => ({
            from: {
                opacity: 0,
                y: 100,
            },
            to: {
                opacity: 1,
                y: 0,
            },
        }),
        {
            once: true,
        }
    )
    
    return (
        <animated.article key={index} 
            className={`h-full flex flex-col bg-white border-2 border-gray-200 rounded-2xl overflow-hidden [perspective:1000px] group ${hoverClasses}`}
            ref={ref}
            style={springs}
        >   
            <ConditionalWrapper
                condition={url}
                wrapper={children => <a href={url} className="h-full flex flex-col" target={targetAttr} rel={relAttr}>{children}</a>}
            >   
                <Fragment>
                    <div className="relative">
                        {imageLabel && (
                            <div className="absolute top-6 left-0 bg-black/50 text-white ring-2 ring-white/20 text-sm font-bold tracking-widest uppercase px-6 py-2 rounded-r-full">
                                {imageLabel}
                            </div>
                        )}
                        {cardImage?.url ? (
                            <Image 
                                src={cardImage.url}
                                alt={cardImage.altText}
                                width={cardImage.width}
                                height={cardImage.height}
                                className={customImageClasses}
                            />    
                        ) : (
                            <Image 
                                src='/images/card-fallback/card-fallback.svg'
                                alt=''
                                width='480'
                                height='480'
                                className={`w-full object-cover ${fallbackImageAspectRatio}`}
                            />
                        )}
                    </div>                
                
                    <div className="p-6 flex flex-col justify-between h-full">
                        
                        {title && (
                            <h3 className="text-secondary text-xl md:text-2xl">
                                {title}
                                {titleSuffix && (<span className="block text-base text-gray-500">{titleSuffix}</span>)}
                            </h3>
                        )}
                        
                        {summary && (
                            <p className={summaryClasses}>
                                {summary}
                            </p>
                        )}

                        {text && (
                            <RichText text={text} customClasses='' invert={false} typeScale={""}/>
                        )} 

                        
                        <div className={`pt-3 mt-auto ${postDate ? "flex items-end justify-between" : "self-end"}`}>
                            {postDate && (
                                <p>
                                    <time className="text-sm text-brand-grey-400" dateTime={dayjs(postDate).format('YYYY-MM-DD')}>
                                        {dayjs(postDate).format('DD MMM, YYYY')}
                                    </time>
                                </p>
                            )}

                            {cardBottomContent && (
                                <CardBottomContent cardBottomContent={cardBottomContent}/>
                            )}

                            {animatedIcon && url && (
                                <>
                                    <div className="relative h-12 w-12" aria-hidden="true">
                                        <div className="absolute inset-0 rounded-full bg-secondary border-[1px] border-white flex justify-center items-center p-4 transition-all duration-700 ease-in-out [transform-style:preserve-3d] [transform:rotateY(180deg)] group-hover:[transform:rotateY(0deg)] text-white">
                                            <span>
                                                {animatedIcon}
                                            </span>
                                        </div>
                                        <div className="absolute inset-0 rounded-full bg-primary flex justify-center items-center p-4 transition-all duration-700 ease-in-out group-hover:[transform:rotateY(180deg)] [backface-visibility:hidden] text-white">
                                            <span>
                                                {animatedIcon}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {tags && (
                            <NewsTags />
                        )}
                    </div>

                </Fragment>

            </ConditionalWrapper>

        </animated.article>
    )
};

export default Card