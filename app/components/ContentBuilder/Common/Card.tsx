import Image from "next/image"
import NewsTags from "../News/NewsTags"
import RichText from "./RichText"
import { useInView, animated } from '@react-spring/web'
import ConditionalWrapper from "../../ConditionalWrapper"
import { Fragment } from "react"

type Props = {
    entry: any,
    tags?: boolean, 
    children?: React.ReactNode,
    image?: {
        altText: string,
        url: string, 
        width: number,
        height: number,
    },
    hover?: boolean,
}

const Card = ({entry, tags = false, children, image}: Props) => {
    
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
    } = entry

    const cardImage = thumbnailImage ? thumbnailImage[0] : image

    const urlCondition = url?.startsWith('http') || url?.startsWith('#') ;
    const targetAttr = url?.startsWith('http') ? '_blank' : undefined;
    const relAttr = urlCondition ? 'nofollow noopener noreferrer' : undefined;

    const hoverClasses = [
        urlCondition ? 'hover:shadow-lg transition-shadow duration-300' : ''
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
    );
    return (
        <animated.article key={index} 
            className={`h-full flex flex-col bg-white border-2 border-gray-200 rounded-2xl overflow-hidden [perspective:1000px] group ${hoverClasses}`}
            ref={ref}
            style={springs}
        >   
            <ConditionalWrapper
                condition={urlCondition}
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
                                className="w-full"
                                loading="lazy"
                            />    
                        ) : (
                            <Image 
                                src='/images/card-fallback/card-fallback.svg'
                                alt=''
                                width='480'
                                height='480'
                                className="w-full"
                                loading="lazy"
                            />
                        )}
                    </div>                
                
                    <div className="flex flex-col gap-3 p-6 h-full">
                        
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

                        {children && (
                            <div className="mt-auto self-end relative h-12 w-12" aria-hidden="true">
                                <div className="absolute inset-0 rounded-full bg-secondary border-[1px] border-white flex justify-center items-center p-4 transition-all duration-500 ease-in-out [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] text-white">
                                    <span className="group-hover:[transform:rotateY(180deg)] transition-all duration-200">
                                        {children}
                                    </span>
                                </div>
                                <div className="absolute inset-0 rounded-full bg-primary flex justify-center items-center p-4 transition-all duration-300 group-hover:[transform:rotateY(180deg)] [backface-visibility:hidden] text-white">
                                    <span>
                                        {children}
                                    </span>
                                </div>
                            </div>
                        )}
                        
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