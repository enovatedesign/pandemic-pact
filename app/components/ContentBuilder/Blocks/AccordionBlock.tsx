import BlockWrapper from "../BlockWrapper"
import RichText from "../Common/RichText"
import { useState } from "react"
import AnimateHeight from 'react-animate-height';
import { useInView, animated } from '@react-spring/web';
import { PlusIcon, MinusIcon } from "@heroicons/react/solid"
import { defaultProseClasses } from '@/app/helpers/prose-classes';

type Props = {
    block: {
        accordions: {
            id: number,
            accordionHeading: string,
            accordionContent: string,
        }[],
        headingLevel: number,
    }
}

const AccordionBlock = ( {block}: Props ) => {
    
    const accordions = block.accordions ?? null
    const headingLevel = block.headingLevel ?? 2

    const textClasses = [
        'mx-auto w-full border-2 border-gray-200 rounded-2xl bg-white max-w-prose',
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
        <BlockWrapper>
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
                                                <RichText customClasses="p-6 pt-3" text={accordionContent} noMaxWidth={true} />
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