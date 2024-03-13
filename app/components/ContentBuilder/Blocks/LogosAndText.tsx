import Image from 'next/image'
import BlockWrapper from '../BlockWrapper'
import { defaultProseClasses } from '@/app/helpers/prose-classes'
import { useInView, animated } from '@react-spring/web';

interface Props {
    block: {
        heading: string, 
        blockContent: any[],   
    }
}

export default function LogosAndText({ block }: Props) {
	const heading = block.heading
	const blockContent = block.blockContent

	if (blockContent.length > 0) {
		return (
			<BlockWrapper>
                {heading && (
                    <div className={`${defaultProseClasses.join(" ")} text-center mb-12`}>
                        <h2 dangerouslySetInnerHTML={{ __html: heading }}></h2>
                    </div>
                )}

                <div className="flex flex-col gap-6">
                    {blockContent.map((content, index: number) => <LogoAndTextItem content={content} key={index} index={index} />
                        
                    )}
                </div>
			</BlockWrapper>
		)
	} else {
		return null;
	}
}

interface LogoAndTextProps {
    content: {
        logos: {
            altText: string,
            url: string,
            width: number,
            height: number,
        }[],
        text: string, 
    }, 
    index: number
}

const LogoAndTextItem = ({content, index}: LogoAndTextProps) => {

    const textClasses = 'prose prose-lg w-full'

    const blockClasses = [
        'bg-white py-6 px-8 rounded-2xl border-2 border-gray-200',
        'flex flex-col md:flex-row gap-6 lg:gap-12 items-center',
        'max-w-5xl mx-auto',
        'w-full',
    ].join(" ")
    
    const [ref, springs] = useInView(
        () => ({
            from: {
                opacity: 0,
                x: index % 2 !== 0 ? 100 : -100,
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

    return (
        <animated.div className={`${blockClasses} ${index % 2 !== 0 && 'md:flex-row-reverse'}`} key={index} ref={ref} style={springs}>

            <div className={`grid ${content.logos.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} items-center gap-6 lg:gap-12`}>

                {content.logos.map((logo, index: number) => {
                    return (
                        <Image
                            key={index}
                            src={logo.url}
                            alt={logo.altText}
                            width={logo.height}
                            height={logo.width}
                            loading="lazy"
                            className="max-w-[12rem] lg:max-w-none w-full mx-auto"
                        />
                    )
                })}

            </div>

            <div className={textClasses} dangerouslySetInnerHTML={{ __html: content.text }}></div>
        </animated.div>
    )
}