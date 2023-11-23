import Button from "../../Button"
import Image from "next/image";
import BlockWrapper from "../BlockWrapper"
import ConditionalWrapper from "../../ConditionalWrapper"

interface Props {
	block: {
		publicationTitle: string,
		publicationType: string,
		summary: string,
		thumbnailImage: {
			altText: string,
			height: number,
			url: string,
			width: number,
		}[],
		externalLink: any,
	}
}

export default function FeaturedPublicationBlock({ block }: Props) {

	const title = block.publicationTitle;
	const summary = block.summary;
	const image = block.thumbnailImage[0];
	const type = block.publicationType;
	const url = block.externalLink;

	const hoverClasses = [
        url ? 'hover:shadow-lg transition duration-300' : ''
    ].join(' ')

	if (title && summary && image) {
		return (
            <BlockWrapper>
                <div className="relative rounded-2xl border-dotted border-2 border-primary p-6 lg:p-12 mx-auto max-w-6xl">
					<p className="absolute inset-x-0 -mt-10 lg:-mt-16 text-center">
						<span className="mx-auto inline-block px-3 py-1 text-gray-500 rounded-full font-bold tracking-widest uppercase bg-gray-50">
							Featured Publication
						</span>
					</p>
                    
					<article className={`border border-gray-200 rounded-2xl overflow-hidden bg-white grid sm:grid-cols-3 xl:grid-cols-4 shadow ${hoverClasses}`}>

						<div className="relative">
							{type && (
								<div className="absolute top-6 lg:top-10 left-0 bg-black/50 text-white ring-2 ring-white/20 text-sm font-bold tracking-widest uppercase px-6 py-2 rounded-r-full">
									{type}
								</div>
							)}
							<ConditionalWrapper
								condition={url}
								wrapper={children => <a href={url}>{children}</a>}
							>
								<Image 
									src={image.url}
									alt={image.altText}
									width={image.width}
									height={image.height}
									className="w-full"
									loading="lazy"
								/>
							</ConditionalWrapper>
						</div>

						<div className="sm:col-span-2 xl:col-span-3 flex justify-center items-center">

							<div className="flex flex-col gap-4 p-6 lg:p-10 h-full">

								<h2 className="text-secondary text-xl md:text-2xl">
									<ConditionalWrapper
										condition={url}
										wrapper={children => <a href={url}>{children}</a>}
									>
										{title}
									</ConditionalWrapper>
								</h2>
								<p className="lg:text-lg">{summary}</p>
								<p className="mt-auto self-end">
									<Button 
										href={url}
										size="small"	
									>
										Read More
									</Button>
								</p>
									
							</div>

						</div>

                    </article>

                </div>
            </BlockWrapper>
		);
	} else {
		return null;
	}
}
