import BlockWrapper from "../BlockWrapper"
import RichText from "../Common/RichText"
import { useState } from "react"
import AnimateHeight from 'react-animate-height';
import { useInView, animated } from '@react-spring/web';
import { PlusIcon, MinusIcon } from "@heroicons/react/solid"

type Props = {
    block: {
        accordions: {
            id: number,
            accordionHeading: string,
            accordionContent: string,
            headingLevel: number,
        }
    }
}

const AccordionBlock = ( {block}: Props ) => {
    
    const accordions = block.accordions ?? null
    const headingLevel = block.headingLevel ?? 2
    
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
                    {accordions.map((accordion, index) => {
                        
                        const accordionHeading = accordion.accordionHeading ?? null
                        const accordionContent = accordion.accordionContent ?? null
                        
                        const accordianData = [accordionHeading, accordionContent] 

                        const handleClick = () => {
                            activeIndex !== index ? setActiveIndex(index) : setActiveIndex(-1)
                        }
                        
                        const iconClasses = 'w-6 h-6 text-primary transition duration-300'
                        return (
                            <>
                                {accordianData && (

                                    <li className="space-y-4" key={index}>
                                        <div role="region" className="mx-auto w-full border border-gray-400 rounded">
                                            
                                                <button
                                                    className="flex items-center justify-between w-full px-6 py-4"
                                                    onClick={handleClick}
                                                >
                                                    {headingLevel === 2 ? (
                                                        <h2 className="mb-0 text-left text-primary text-4xl font-bold">
                                                                { accordionHeading }
                                                        </h2>
                                                    ) : (
                                                        <h3 className="mb-0 text-left text-primary text-4xl font-bold">
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
                                                    <RichText customClasses="p-6 pt-3" text={accordionContent} />
                                            </AnimateHeight>
                                        </div>

                                    </li>
                                )}
                            </>
                        )
                    })}
                </animated.ul>
            )}
        </BlockWrapper>
    )
}

export default AccordionBlock