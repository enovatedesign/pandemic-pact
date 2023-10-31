import { Block } from "@react-three/fiber/dist/declarations/src/core/utils"
import BlockWrapper from "../BlockWrapper"
import RichText from "../Common/RichText"

type Props = {
    block : {
        id: number,
        typeHandle: string,
        text: string,
        quoteName: string,
        quotePosition: string,
        quoteCompany: string,
    }
}

const PullQuoteBlock = ({block}: Props) => {

    const text = block.text ?? null
    const quoteName = block.quoteName ?? null
    const quotePosition = block.quotePosition ?? null
    const quoteCompany = block.quoteCompany ?? null
    const quoteCite = quoteCompany && quotePosition ? [quotePosition, quoteCompany].join(', ') : null

    return (
        <>
            {text && (
                <BlockWrapper options={{padded: true, fill: true}}>
                    <div className="flex flex-col space-y-4 md:space-y-6 md:items-center">
                        <div>
                            <RichText text={text} customClasses="md:text-center"/>
                        </div>
                        <div className="text-right md:text-center">
                            {quoteName && (
                                <p className="text-gray-700 "><strong>{ quoteName }</strong></p>
                            )}

                            {quoteCite ? (
                                <p className="text-gray-600 text-sm">{quoteCite}</p>
                            ) : (
                                <>
                                    {quoteCompany && (
                                        <p className="text-gray-600 text-sm">{quoteCompany}</p>
                                    )}
                                </>  
                            )}
                        </div>
                    </div>

                </BlockWrapper>
            )}
        </>
    )
}

export default PullQuoteBlock

// {% if text|length %}
//     {% set textLength = text|length %}

//     {% set textClasses = [
//         macros.richTextEditorClasses(),
//         (textLength < 300) ? 'prose-lg lg:prose-2xl',
//         'md:text-center',
//         'mx-auto'
//     ]|filter|join(' ') %}

//     {% embed '_components/blocks/blockWrapper' with {
//         fill: true
//     } %}

//         {% block blockContent %}

//             {% import "_components/macros" as macros %}

//             <blockquote {{ macros.inView() }}>

//                 <div class="{{ textClasses }}">{{ text }}</div>

//                 {% if quoteInfo|length %}

//                     {% set quoteCite = [sourcePosition, sourceCompany]|filter|join(', ') %}

//                     <footer class="mt-8 text-right md:text-center">
//                         {% if name|length %}
//                             <p class="text-gray-700"><strong>{{ name }}</strong></p>
//                         {% endif %}

//                         {% if quoteCite|length %}
//                             <p class="text-gray-600 text-sm">{{ quoteCite }}</p>
//                         {% endif %}
//                     </footer>

//                 {% endif %}

//             </blockquote>

//         {% endblock %}

//     {% endembed %}

// {% endif %}