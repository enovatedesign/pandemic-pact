import BlockWrapper from "../BlockWrapper"
import Image from "next/image"
import RichText from "../Common/RichText"
import ButtonLink from "../Common/Button"
import { useInView, animated } from '@react-spring/web';

const SplitImageTextBlock = ({block}) => {

    const image = block.image[0] ?? null
    const text = block.text ?? null
    const button = block.button ?? null
    const reverse = block.reverse ?? false

    const gridClasses = [
        'grid gap-y-12 md:grid-cols-2 gap-x-8 md:gap-x-12 lg:gap-x-24 lg:gap-y-0'
    ].join(' ');

    const textWrapperClasses = [
        'mx-auto h-full',
        'flex flex-col justify-evenly items-start',
        reverse ? 'md:col-start-2 md:row-start-1' : '',
    ].join(' ');

    const imageWrapperClasses = [
        'flex items-center',
        reverse ? 'md:col-start-1 md:row-start-1' : '',
    ].join(' ');


    const [leftRef, leftSprings] = useInView(
        () => ({
            from: {
                opacity: 0,
                x: !reverse ? -100 : 100,
            },
            to: {
                opacity: 1,
                x: 0,
            },
        }),
        {
            once: true,
        }
    );

    const [rightRef, rightSprings] = useInView(
        () => ({
            from: {
                opacity: 0,
                x: !reverse ? 100 : -100,
            },
            to: {
                opacity: 1,
                x: 0,
            },
        }),
        {
            once: true,
        }
    );

    return(
        <BlockWrapper>
            <section className={gridClasses}>
                <animated.div ref={leftRef} style={leftSprings} className={textWrapperClasses}>

                    {text && (
                        <RichText text={text} />
                    )}

                    {button.url && (
                        <ButtonLink 
                            linkTo={button.url}
                            title={button.text}
                        />
                    )}
                </animated.div>

                <animated.div ref={rightRef} style={rightSprings} className={imageWrapperClasses}>
                    <Image
                        alt={image.altText}
                        height={image.height}
                        src={image.url}
                        width={image.width}
                        className="w-full"
                        loading="lazy"
                    />
                </animated.div>

            </section>
        </BlockWrapper>
    )
}

export default SplitImageTextBlock


