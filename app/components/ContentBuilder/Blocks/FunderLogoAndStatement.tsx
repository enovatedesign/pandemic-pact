import Image from 'next/image'
import BlockWrapper from '../BlockWrapper'
import { defaultProseClasses } from '@/app/helpers/prose-classes'

export default function FunderLogoAndStatement({ block }) {
	const heading = block.heading
	const funders = block.funders

	if (funders.length > 0) {
		const textClasses = [
            'prose prose-lg dark:prose-invert',
            'md:col-span-2 lg:col-span-3',
            'flex justify-center items-center',
            'w-full',
        ].join(" ")

        const blockClasses = [
            'bg-white py-6 px-8 rounded-2xl border-2 border-gray-200 dark:bg-gray-800 dark:border-gray-700',
            'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-12 items-center',
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
                        return (
                            <div className={`${blockClasses} ${index % 2 !== 0 && 'md:col-start-2 lg:col-start-3 md:row-start-1'}`} key={index}>

                                <div className="flex justify-center lg:flex-col gap-6">

                                    {funder.funderLogos.map((logo, index) => {
                                        return (
                                            <Image
                                                key={index}
                                                src={logo.url}
                                                alt={logo.altText}
                                                width={logo.height}
                                                height={logo.width}
                                                loading="lazy"
                                                className="w-36 lg:w-48 mx-auto"
                                            />
                                        )
                                    })}

                                </div>

                                <div className={`${textClasses} ${index % 2 !== 0 && 'md:col-start-1 md:row-start-1'}`}>
                                    <div className="w-full">
                                        <h3 className="my-0" dangerouslySetInnerHTML={{ __html: funder.funderName }}></h3>
                                        <p className="my-0" dangerouslySetInnerHTML={{ __html: funder.fundingStatement }}></p>
                                    </div>
                                </div>

                            </div>
                        )
                    })}
                </div>
			</BlockWrapper>
		)
	} else {
		return null;
	}
}