
import BlockWrapper from "../BlockWrapper"
import RichText from "../Common/RichText"
import { useState } from "react"
import { useInView, useTransition, animated } from '@react-spring/web';

type Props = {
    block: {
        id: number,
        typeHandle: string,
        tabs: {
            id: number,
            heading: string,
            richText: string,
          }[],
        }
    };

const TabbedContentBlock = ( {block}: Props ) => {

    const tabs = block.tabs ?? null

    const [activeIndex, setActiveIndex] = useState(0)

    const transitions = useTransition(activeIndex, {
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        config: { duration: 200 },
    })

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

    return(
        <BlockWrapper>
            <animated.div ref={ref} style={springs}>

                {tabs && (
                    <div className='w-full breakout'>
                        <div className="overflow-x-auto md:overflow-visible">
                            <div className="inline-block min-w-full px-6">
                                <ul role="tablist"
                                    className="overflow-x-hidden flex justify-center items-stretch space-x-1 lg:space-x-2"
                                >
                                    {tabs.map((tab, index: number) => {
                                        
                                        const handleClick = () => {
                                            setActiveIndex(index)
                                        }

                                        const conditionalClasses = [
                                            activeIndex === index ? 'bg-white' : 'bg-gray-200'
                                        ].join(' ');

                                        return(
                                            <li key={index}>
                                                <button
                                                    type="button"
                                                    className={`${conditionalClasses} whitespace-nowrap md:whitespace-normal inline-flex px-4 py-2 border-t border-gray-300 border-l border-r rounded-t-md`}
                                                    role="tab"
                                                    onClick={handleClick}
                                                >
                                                    { tab.heading }
                                                </button>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        </div>
                        
                        <div className="flex justify-center">
                            <div className="bg-white md:rounded-md shadow-lg w-full">
                                <section
                                    className="p-6 md:p-8"
                                    role="tabpanel"
                                >
                                    <div className="relative">
                                        {transitions((style, item) => {
                                            const tab = tabs[item]
                                            return (
                                                <animated.div style={style} className={item !== activeIndex ? 'absolute inset-0' : ''}>
                                                    <RichText text={tab.richText} customClasses='max-w-none' invert={false} typeScale={""}/>
                                                </animated.div>
                                            )
                                        })}
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                )}
            </animated.div>
        </BlockWrapper>
    )
}
export default TabbedContentBlock
