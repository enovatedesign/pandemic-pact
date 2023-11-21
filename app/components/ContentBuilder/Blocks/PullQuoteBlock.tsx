import BlockWrapper from "../BlockWrapper"
import RichText from "../Common/RichText"
import { useInView, animated } from '@react-spring/web';

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
        <>
            {text && (
                <BlockWrapper options={{padded: true, fill: true}}>
                    <animated.div className="flex flex-col space-y-4 md:space-y-6 md:items-center" ref={ref} style={springs}>
                        <div>
                            <RichText text={text} customClasses="md:text-center" invert={false} typeScale={""}/>
                        </div>
                        <div className="text-right md:text-center">
                            {quoteName && (
                                <p className="text-gray-700 "><strong>{quoteName}</strong></p>
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
                    </animated.div>
                </BlockWrapper>
            )}
        </>
    )
}

export default PullQuoteBlock
