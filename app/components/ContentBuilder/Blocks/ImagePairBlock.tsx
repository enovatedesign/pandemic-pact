import BlockWrapper from "../BlockWrapper"
import Image from "next/image"
import { useInView, animated } from '@react-spring/web';

type Props = {
    block: {
        imageLeft: {
            url: string,
            alt: string,
            width: number, 
            height: number, 
        }
        imageLeftCaption: string,
        imageRight: {
            url: string,
            alt: string,
            width: number, 
            height: number, 
        }
        imageRightCaption: string,
    }
  }

const ImagePairBlock = ( {block} : Props ) => {

    const imageLeft = block.imageLeft[0] ?? null
    const imageLeftCaption = block.imageLeftCaption ?? null
    const imageRight = block.imageRight[0] ?? null
    const imageRightCaption = block.imageRightCaption ?? null
    const images = [imageLeft, imageRight]

    const [leftRef, leftSprings] = useInView(
        () => ({
            from: {
                opacity: 0,
                x: -100,
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
                x: 100 
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
            {images && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-12 lg:gap-x-24">
                    <animated.figure ref={leftRef} style={leftSprings}>
                        <Image
                            alt={imageLeft.altText}
                            height={imageLeft.height}
                            src={imageLeft.url}
                            width={imageLeft.width}
                            className="w-full"
                            loading="lazy"
                        />

                        {imageLeftCaption && (
                            <figcaption className="mt-4 font-medium text-base text-gray-600 text-center">{ imageLeftCaption }</figcaption>
                        )}
                    </animated.figure>

                    <animated.figure ref={rightRef} style={rightSprings}>
                        <Image
                            alt={imageRight.altText}
                            height={imageRight.height}
                            src={imageRight.url}
                            width={imageRight.width}
                            className="w-full"
                            loading="lazy"
                        />

                        {imageRightCaption && (
                            <figcaption className="mt-4 font-medium text-base text-gray-600 text-center">{ imageRightCaption }</figcaption>
                        )}
                    </animated.figure>
                </div>
            )}
        </BlockWrapper>
    )
}

export default ImagePairBlock

{/* <div 
    {{ macros.inView({
        animateChildren: true,
        delayIncrement: 200,
        customClasses: 'grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-12 lg:gap-x-24'
    }) }}
>

    <figure>
        {{ macros.lazyResponsiveImage(imageLeft.altText|default(null), imageLeft, 'w-full', respMap.srcset, respMap.sizes) }}

        {% if imageLeftCaption|length %}
            <figcaption class="mt-4 font-medium text-base text-gray-600 text-center">{{ imageLeftCaption }}</figcaption>
        {% endif %}
    </figure>

    <figure>
        {{ macros.lazyResponsiveImage(imageRight.altText|default(null), imageRight, 'w-full', respMap.srcset, respMap.sizes) }}

        {% if imageRightCaption|length %}
            <figcaption class="mt-4 font-medium text-base text-gray-600 text-center">{{ imageRightCaption }}</figcaption>
        {% endif %}
    </figure>

</div> */}