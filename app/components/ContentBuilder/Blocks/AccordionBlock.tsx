"use client"

import { isValidElement, ReactNode, useState } from "react"
import AnimateHeight from 'react-animate-height';
import { useInView, animated } from '@react-spring/web';
import { PlusIcon, MinusIcon } from "@heroicons/react/solid"

import { defaultProseClasses } from '@/app/helpers/prose-classes';
import BlockWrapper from "../BlockWrapper"
import RichText from "../Common/RichText"

type Props = {
    block: {
        heading?: string,
        accordions: {
            id?: number,
            accordionHeading: string,
            accordionContent: string | ReactNode,
        }[],
        headingLevel: number,
        padded?: boolean
    }
}

const AccordionBlock = ( { block }: Props ) => {
    
    const title = block.heading ?? null // Named as heading in cms due to title being a reserved word
    const accordions = block.accordions ?? null
    const headingLevel = block.headingLevel ?? 2

    // Added "padded" for accordion block usage on rrna visualise page client
    // This may be changed to a content managed page
    // For speed, this has been added manually while discussions around CMS integration are had
    const padded = block.padded ?? true

    const textClasses = [
        'mx-auto w-full border-2 border-gray-200 rounded-2xl bg-white max-w-[80ch]',
        defaultProseClasses({ })
    ].join(' ')
    
    const [activeIndex, setActiveIndex] = useState(-1)

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
        <BlockWrapper options={{ padded: padded }}>
            <div className={defaultProseClasses({ customClasses: 'mb-8 lg:mb-12' })}>
                {title &&(
                    <h2>
                        {title}
                    </h2>
                )}
            </div>
            
            {accordions && (
                <animated.ul className="space-y-4" ref={ref} style={springs}>
                    {accordions.map((accordion, index: number) => {
                        
                        const accordionHeading = accordion.accordionHeading ?? null
                        const accordionContent = accordion.accordionContent ?? null
                        
                        const accordionData = [accordionHeading, accordionContent] 

                        const handleClick = () => {
                            activeIndex !== index ? setActiveIndex(index) : setActiveIndex(-1)
                        }
                        
                        const iconClasses = 'w-6 h-6 text-primary transition duration-300'
                        return (
                            <li className="space-y-4" key={index}>
                                {accordionData && (
                                    <div role="region" className={textClasses}>
                                        
                                        <button
                                            className="flex items-center justify-between w-full px-6 py-4"
                                            onClick={handleClick}
                                        >
                                            {headingLevel === 2 ? (
                                                <h2 className="!my-0 text-left text-primary text-xl md:text-3xl lg:text-3xl">
                                                        { accordionHeading }
                                                </h2>
                                            ) : (
                                                <h3 className="!my-0 text-left text-primary text-xl md:text-3xl lg:text-3xl">
                                                    { accordionHeading }
                                                </h3>
                                            )}
                                            
                                            {/* sort icons */}
                                            {activeIndex === index ? (
                                                <MinusIcon className={iconClasses}/>
                                            ) : (
                                                <PlusIcon className={iconClasses}/>
                                            )}
                                        </button>

                                        <AnimateHeight
                                            duration={300}
                                            height={activeIndex === index ? 'auto' : 0}
                                        >   
                                            {isValidElement(accordionContent) ? (
                                                <div className="p-6 pt-3">
                                                    {accordionContent}
                                                </div>
                                            ) : (
                                                <RichText 
                                                    customClasses="p-6 pt-3" 
                                                    text={accordionContent as string} 
                                                    noMaxWidth={true} 
                                                />
                                            )}
                                        </AnimateHeight>
                                    </div>
                                )}
                            </li>
                        )
                    })}
                </animated.ul>
            )}
        </BlockWrapper>
    )
}

export default AccordionBlock