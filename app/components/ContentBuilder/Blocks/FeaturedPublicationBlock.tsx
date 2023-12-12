import Image from "next/image";
import BlockWrapper from "../BlockWrapper"
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

	const hoverClasses = [
        url ? 'hover:shadow-lg transition duration-300' : ''
    ].join(' ')

	if (title) {
		return (
            <BlockWrapper>

				<div className="flex justify-center -mx-6 ">
					<div className="relative rounded-2xl border-dotted border-2 border-primary p-6 lg:p-12 mx-6 max-w-6xl">
						<p className="absolute inset-x-0 -mt-10 lg:-mt-16 text-center">
							<span className="mx-auto inline-block px-3 py-1 text-gray-500 rounded-full font-bold tracking-widest uppercase bg-gray-50">
								Featured Publication
							</span>
						</p>
						
						<a href={url} target="_blank" rel="nofollow noopener noreferrer">

							<article className={`-mx-12 md:-mx-0 md:border md:border-gray-200 md:rounded-2xl overflow-hidden bg-white grid sm:grid-cols-3 lg:grid-cols-4 shadow [perspective:1000px] group  ${hoverClasses}`}>

								<div className="relative ">
									{type && (
										<div className="absolute top-6 lg:top-10 left-0 bg-black/50 text-white ring-2 ring-white/20 text-sm font-bold tracking-widest uppercase px-6 py-2 rounded-r-full">
											{type}
										</div>
									)}
									{image?.url ? (
										<Image 
											src={image.url}
											alt={image.altText}
											width={image.width}
											height={image.height}
											className="w-full h-full object-cover"
											loading="lazy"
										/>    
									) : (
										<Image 
											src='/images/card-fallback/card-fallback.svg'
											alt=''
											width='480'
											height='480'
											className="w-full h-full object-cover"
											loading="lazy"
										/>
									)}
								</div>

								<div className="sm:col-span-2 lg:col-span-3 flex justify-center items-center">

									<div className="flex flex-col gap-4 p-6 lg:p-10 h-full">

										<h2 className="text-secondary text-xl md:text-2xl">
											{title}
										</h2>

										<p className="lg:text-lg">{summary}</p>

										<div className="mt-auto self-end relative h-12 w-12" aria-hidden="true">
											<p className="absolute inset-0 rounded-full bg-secondary border-[1px] border-white flex justify-center items-center p-4 transition-all duration-300 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] text-white ">
												<span className="group-hover:[transform:rotateY(180deg)] transition-all duration-200">
													<ExternalLinkIcon className="w-6 h-6" />
												</span>
											</p>
											<p className="absolute inset-0 rounded-full bg-primary flex justify-center items-center p-4 transition-all duration-300 group-hover:[transform:rotateY(180deg)] [backface-visibility:hidden]  text-white">
												<span>
													<ExternalLinkIcon className="w-6 h-6" />
												</span>
											</p>
										</div>
									
									</div>

								</div>

							</article>
						</a>

					</div>
				</div>

            </BlockWrapper>
		);
	} else {
		return null;
	}
}
