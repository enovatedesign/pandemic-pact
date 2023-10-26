import { set } from "lodash"
import BlockWrapper from "../BlockWrapper"
import RichText from "../Common/RichText"
import { useState } from "react"
import AnimateHeight from 'react-animate-height';

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
    
    const [activeIndex, setActiveIndex] = useState(-1)
    
    return (
        <BlockWrapper>
            {accordions && (
                <ul>
                    {accordions.map((accordion, index) => {
                        
                        const accordionHeading = accordion.accordionHeading ?? null
                        const accordionContent = accordion.accordionContent ?? null
                        const accordianData = [accordionHeading, accordionContent] 


                        const handleClick = () => {
                            activeIndex !== index ? setActiveIndex(index) : setActiveIndex(-1)
                        }
                        console.log(activeIndex)
                        return (
                            <>
                                {accordianData && (

                                    <li className="space-y-4" key={index}>
                                        <div role="region" className="mx-auto w-full border border-gray-400 rounded">
                                            
                                                <h2 className="mb-0">
                                                    <button
                                                        className="flex items-center justify-between w-full px-6 py-4"
                                                        onClick={handleClick}
                                                    >
                                                        <span className="text-left text-primary text-4xl font-bold">{ accordionHeading }</span>
                                                        
                                                        {/* sort icons */}
                                                        <span aria-hidden="true" className="text-xl fa-solid fa-minus ml-4 text-primary"></span>
                                                        <span aria-hidden="true" className="text-xl fa-solid fa-plus ml-4 text-primary"></span>
                                                    </button>
                                                </h2>

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
                </ul>
            )}
        </BlockWrapper>
    )
}

export default AccordionBlock

// {% set headingLevel = block.headingLevel.value|default('2') %}

// {% if accordions|length %}
//     {% set textClasses = [
//         macros.richTextEditorClasses({ withContent: true }),
//     ]|filter|join(' ') %}

//     {% embed '_components/blocks/blockWrapper' %}

//         {% block blockContent %}

//             <div x-data="{ active: 1 }" className="space-y-4">

//                 {% for accordion in accordions %}

//                     <div x-data="{
//                             id: {{ loop.index }},
//                             get expanded() {
//                                 return this.active === this.id
//                             },
//                             set expanded(value) {
//                                 this.active = value ? this.id : null
//                             },
//                         }" role="region" className="mx-auto w-full border border-gray-400 rounded {{ textClasses }}">
//                         <h{{ headingLevel }} className="mb-0">
//                             <button
//                                 x-on:click="expanded = !expanded"
//                                 :aria-expanded="expanded"
//                                 className="flex items-center justify-between w-full px-6 py-4"
//                             >
//                                 <span className="text-left">{{ accordion.accordionHeading }}</span>
//                                 <span x-show="expanded" aria-hidden="true" className="text-xl fa-solid fa-minus ml-4">&minus;</span>
//                                 <span x-show="!expanded" aria-hidden="true" className="text-xl fa-solid fa-plus ml-4">&plus;</span>
//                             </button>
//                         </h{{ headingLevel }}>

//                         <div x-show="expanded" x-collapse>
//                             <div className="p-6 pt-3 {{ textClasses }}">
//                                 {{ accordion.accordionContent }}
//                             </div>
//                         </div>
//                     </div>

//                 {% endfor %}

//             </div>

//         {% endblock %}

//     {% endembed %}

// {% endif %}
