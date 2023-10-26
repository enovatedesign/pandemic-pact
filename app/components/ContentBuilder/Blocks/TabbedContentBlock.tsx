
import BlockWrapper from "../BlockWrapper"
import RichText from "../Common/RichText"
import { useState } from "react"

const TabbedContentBlock = ({block}) => {

    const tabs = block.tabs ?? null

    const [activeIndex, setActiveIndex] = useState(0)

    return(
        <BlockWrapper>
            {tabs && (
                <div>
                    <ul
                        role="tablist"
                        className="overflow-x-hidden flex justify-center items-stretch space-x-1 lg:space-x-2"
                    >
                    {tabs.map((tab, index) => {
                        
                        
                        const handleClick = () => {
                            setActiveIndex(index)
                        }

                        return(
                            <li key={index}>
                                <button
                                    type="button"
                                    className="whitespace-nowrap md:whitespace-normal inline-flex px-4 py-2 border-t border-gray-300 border-l border-r rounded-t-md"
                                    role="tab"
                                    onClick={handleClick}
                                >
                                    { tab.heading }
                                </button>
                            </li>
                        )
                    })}
                    </ul>
                    
                    <div>
                        <div className="flex justify-center">
                            <div className="bg-white md:rounded-md shadow-lg">
                                <section
                                    className="p-6 md:p-8"
                                    role="tabpanel"
                                >
                                    <ul>
                                        {tabs.map((tab, index) => {
                                            return (
                                            <>
                                                {activeIndex === index && (

                                                    <li key={index}>
                                                        <RichText text={tab.richText}/>
                                                    </li>
                                                )}
                                            </>
                                            )
                                        })}
                                    </ul>
                                </section>
                            </div>
                        </div> 
                    </div>
                </div>
            )}
        </BlockWrapper>
    )
}
export default TabbedContentBlock
