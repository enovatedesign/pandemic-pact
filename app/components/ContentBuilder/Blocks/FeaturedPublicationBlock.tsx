import Image from "next/image";
import BlockWrapper from "../BlockWrapper"
import { ExternalLinkIcon } from "@heroicons/react/outline"
import dayjs from 'dayjs'
import Card from "../Common/Card";

interface Props {
	block: {
        id: string,
        typeHandle: string,
        featuredPublication: {
            id: number,
            title: string,
            summary: string,
            externalLink: string,
			postDate: number,
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

	const publications = block.featuredPublication ?? null

	const cardBlock = publications.length === 3 ? true : false

	if (publications) {
		return (
            <BlockWrapper>

				<div className="flex justify-center mx-[calc(-1.5rem-2px)]">
					<div className="relative rounded-2xl border-dotted border-2 border-primary p-6 lg:p-12 mx-6 max-w-6xl">
						<p className="absolute inset-x-0 -mt-10 lg:-mt-16 text-center">
							<span className="mx-auto inline-block px-3 py-1 text-gray-500 rounded-full font-bold tracking-widest uppercase bg-gray-50">
								Featured Publication<span>
										{publications.length > 1 && "s"}
									</span>
							</span>
						</p>

						<ul className={cardBlock ? 'grid gap-6 md:grid-cols-3' : 'flex flex-col gap-y-6'}>
							{publications.map((publication, index: number) => {
								
								const cardData = {
									title: publication.title,
									imageLabel: publication.publicationType,
									summary: publication.summary,
									summaryClasses: '',
									image: publication.thumbnailImage[0],
									url: publication.externalLink,
									postDate: publication.postDate,
								}
								
								const hoverClasses = [
									cardData.url ? 'hover:shadow-lg transition duration-300' : ''
								].join(' ')	
								
								return (
									<li key={index}>
										{!cardBlock ? (

											<a href={cardData.url} target="_blank" rel="nofollow noopener noreferrer">

												<article className={`-mx-12 md:-mx-0 md:border md:border-gray-200 md:rounded-2xl overflow-hidden bg-white grid sm:grid-cols-3 lg:grid-cols-4 shadow [perspective:1000px] group  ${hoverClasses}`}>

													<div className="relative ">
														{cardData.imageLabel && (
															<div className="absolute top-6 lg:top-10 left-0 bg-black/50 text-white ring-2 ring-white/20 text-sm font-bold tracking-widest uppercase px-6 py-2 rounded-r-full">
																{cardData.imageLabel}
															</div>
														)}
														{cardData.image?.url ? (
															<Image 
																src={cardData.image.url}
																alt={cardData.image.altText}
																width={cardData.image.width}
																height={cardData.image.height}
																className="w-full h-full object-cover"
																loading="lazy"
															/>    
														) : (
															<Image 
																src='/images/card-fallback/card-fallback.svg'
																alt=''
																width='480'
																height='300'
																className="w-full h-full object-cover"
																loading="lazy"
															/>
														)}
													</div>

													<div className="sm:col-span-2 lg:col-span-3 flex justify-center items-center">

														<div className="flex flex-col gap-4 p-6 lg:p-10 h-full">

															<h2 className="text-secondary text-xl md:text-2xl">
																{cardData.title}
															</h2>

															<p className="lg:text-lg">{cardData.summary}</p>

															<div className="flex items-end justify-between">
																{cardData.postDate && (
																	<p>
																		<time className="text-brand-grey-400" dateTime={dayjs(cardData.postDate).format('YYYY-MM-DD')}>
																			{dayjs(cardData.postDate).format('DD MMM, YYYY')}
																		</time>
																	</p>
																)}
																<div className="mt-auto self-end relative h-12 w-12" aria-hidden="true">
																	<div className="absolute inset-0 rounded-full bg-secondary border-[1px] border-white flex justify-center items-center p-4 transition-all duration-700 ease-in-out [transform-style:preserve-3d] [transform:rotateY(180deg)] group-hover:[transform:rotateY(0deg)] text-white">
																		<span>
																			<ExternalLinkIcon className="w-6 h-6" />
																		</span>
																	</div>
																	<div className="absolute inset-0 rounded-full bg-primary flex justify-center items-center p-4 transition-all duration-700 ease-in-out group-hover:[transform:rotateY(180deg)] [backface-visibility:hidden] text-white">
																		<span>
																			<ExternalLinkIcon className="w-6 h-6" />
																		</span>
																	</div>
																</div>
															</div>
														</div>

													</div>

												</article>
											</a>
										) : (
											<Card 
												entry={cardData}  
												image={cardData.image}
												animatedIcon={<ExternalLinkIcon className="w-6 h-6" />}
											/>
										)}	
									</li>
								)
							} )}
						</ul>


					</div>
				</div>

            </BlockWrapper>
		);
	} else {
		return null;
	}
}
