import BlockWrapper from "../BlockWrapper"
import Image from "next/image"
import RichText from "../Common/RichText"
import ButtonLink from "../Common/Button"

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


    return(
        <BlockWrapper>
            <section className={gridClasses}>
                <div className={textWrapperClasses}>

                    {text && (
                        <RichText text={text} />
                    )}

                    {button.url && (
                        <ButtonLink 
                            linkTo={button.url}
                            title={button.text}
                        />
                    )}
                </div>
                <div className={imageWrapperClasses}>
                    <Image
                        alt={image.altText}
                        height={image.height}
                        src={image.url}
                        width={image.width}
                        className="w-full"
                        loading="lazy"
                    />
                </div>

            </section>
        </BlockWrapper>
    )
}

export default SplitImageTextBlock


