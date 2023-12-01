import Button from "../../Button"
import Image from "next/image";
import BlockWrapper from "../BlockWrapper"
import ConditionalWrapper from "../../ConditionalWrapper"
import { ExternalLinkIcon } from "@heroicons/react/outline"

interface Props {
	block: {
        id: string,
        typeHandle: string,
        featuredPublication: {
            id: number,
            title: string,
            summary: string,
            externalLink: string,
            thumbnailImage: {
                altText: string,
                height: number,
                url: string,
                width: number,
            }[],
            publicationType: string,
        }[],
    }
}

export default function FeaturedPublicationBlock({ block }: Props) {

	const pub = block.featuredPublication[0];

	const title = pub.title;
	const summary = pub.summary;
	const image = pub.thumbnailImage[0];
	const type = pub.publicationType;
	const url = pub.externalLink;
	const urlCondition = url?.startsWith('http');

	const hoverClasses = [
        url ? 'hover:shadow-lg transition duration-300' : ''
    ].join(' ')

	if (title) {
		return (
            <BlockWrapper >
				<div className="flex justify-center -mx-6">
					<div className="relative rounded-2xl border-dotted border-2 border-primary p-6 lg:p-12 mx-6 max-w-6xl">
						<p className="absolute inset-x-0 -mt-10 lg:-mt-16 text-center">
							<span className="mx-auto inline-block px-3 py-1 text-gray-500 rounded-full font-bold tracking-widest uppercase bg-gray-50">
								Featured Publication
							</span>
						</p>
						
						<article className={`-mx-12 md:-mx-0 md:border md:border-gray-200 md:rounded-2xl overflow-hidden bg-white grid sm:grid-cols-3 lg:grid-cols-4 shadow ${hoverClasses}`}>

							<div className="relative ">
								{type && (
									<div className="absolute top-6 lg:top-10 left-0 bg-black/50 text-white ring-2 ring-white/20 text-sm font-bold tracking-widest uppercase px-6 py-2 rounded-r-full">
										{type}
									</div>
								)}
								<ConditionalWrapper
									condition={urlCondition}
									wrapper={children => <a href={url}>{children}</a>}
								>
									{image?.url ? (
										<Image 
											src={image.url}
											alt={image.altText}
											width={image.width}
											height={image.height}
											className="w-full"
											loading="lazy"
										/>    
									) : (
										<Image 
											src='/images/card-fallback/card-fallback.svg'
											alt=''
											width='480'
											height='480'
											className="w-full"
											loading="lazy"
										/>
									)}
								</ConditionalWrapper>
							</div>

							<div className="sm:col-span-2 xl:col-span-3 flex justify-center items-center">

								<div className="flex flex-col gap-4 p-6 lg:p-10 h-full">

									<h2 className="text-secondary text-xl md:text-2xl">
										<ConditionalWrapper
											condition={urlCondition}
											wrapper={children => <a href={url}>{children}</a>}
										>
											{title}
										</ConditionalWrapper>
									</h2>
									<p className="lg:text-lg">{summary}</p>
									{urlCondition && (
										<p className="mt-auto self-end">
											<Button 
												href={url}
												size="small"
												customClasses="mt-3 self-end flex items-center gap-1"
											>
												Read More <ExternalLinkIcon className="w-4 h-4" />
											</Button>
										</p>
									)}	
								</div>

							</div>

						</article>

					</div>
				</div>
            </BlockWrapper>
		);
	} else {
		return null;
	}
}
