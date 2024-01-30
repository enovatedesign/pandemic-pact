import Image from 'next/image';
import BlockWrapper from '../BlockWrapper';
import { useInView, animated } from '@react-spring/web';

interface Props {
    block: {
        caption: string,
        width: string,
        popIpBox: boolean,
        image: {
            height: number, 
            width: number,
            url: string,
            altText: string,
        }[],
    }
}

export default function ImageBlock({ block }: Props) {

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

    const caption = block.caption;
    const image = block.image[0];
    const width = block.width;

    const imageWidthLookup = {
        full: { 
			classes: 'w-full', 
			sizes: '100vw'
		},
        'three-quarters': {
            classes: 'w-3/4',
            sizes: '(min-width: 786px) 66vw, (min-width: 1024px) 75vw, 100vw',
        },
        'two-thirds': {
            classes: 'w-2/3',
            sizes: '(min-width: 786px) 66vw, 100vw',
        },
        'one-half': {
            classes: 'w-1/2',
            sizes: '(min-width: 786px) 66vw, (min-width: 1024px) 50vw, 100vw',
        },
    };

    if (image && width) {
        const blockClasses = ['mx-auto w-full'].join(' ');

        return (
            <BlockWrapper>
                <animated.div ref={ref} style={springs}>
                    <figure
                        className={`${imageWidthLookup[width as keyof typeof imageWidthLookup].classes} px-0 mx-auto`}
                    >
                        <div className="breakout">
                            <Image
                                alt={image.altText}
                                height={image.height}
                                src={image.url}
                                width={image.width}
                                sizes={imageWidthLookup[width as keyof typeof imageWidthLookup].sizes}
                                className="w-full"
                                loading="lazy"
                            />
                        </div>
                        {caption && (
                            <figcaption className="mt-4 font-medium text-sm text-gray-600">
                                {caption}
                            </figcaption>
                        )}
                    </figure>
                </animated.div>
            </BlockWrapper>
        );
    } else {
        return null;
    }
}
