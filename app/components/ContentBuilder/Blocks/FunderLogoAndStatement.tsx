import Image from 'next/image'
import BlockWrapper from '../BlockWrapper'
import { defaultProseClasses } from '@/app/helpers/prose-classes'
import { useInView, animated } from '@react-spring/web';

export default function FunderLogoAndStatement({ block }) {
	const heading = block.heading
	const funders = block.funders

	if (funders.length > 0) {
		const textClasses = [
            'prose prose-lg dark:prose-invert',
            'flex justify-center items-center',
            'w-full',
        ].join(" ")

        const blockClasses = [
            'bg-white py-6 px-8 rounded-2xl border-2 border-gray-200 dark:bg-gray-800 dark:border-gray-700',
            'flex flex-col md:flex-row gap-6 lg:gap-12 items-center',
            'max-w-5xl mx-auto',
            'w-full',
        ].join(" ")

		return (
			<BlockWrapper>
                {heading && (
                    <div className={`${defaultProseClasses.join(" ")} text-center mb-12`}>
                        <h2 dangerouslySetInnerHTML={{ __html: heading }}></h2>
                    </div>
                )}

                <div className="flex flex-col gap-6">
                    {funders.map((funder, index) => {

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

                                <div className={`grid ${funder.funderLogos.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} items-center gap-6 lg:gap-12`}>

                                    {funder.funderLogos.map((logo, index) => {
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

                                <div className={textClasses}>
                                    <div className="w-full">
                                        <h3 className="my-0" dangerouslySetInnerHTML={{ __html: funder.funderName }}></h3>
                                        <p className="my-0" dangerouslySetInnerHTML={{ __html: funder.fundingStatement }}></p>
                                    </div>
                                </div>

                            </animated.div>
                        )
                    })}
                </div>
			</BlockWrapper>
		)
	} else {
		return null;
	}
}