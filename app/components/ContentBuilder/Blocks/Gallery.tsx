import BlockWrapper from '../BlockWrapper';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules"
import "swiper/css/bundle"

type Props = {
	block: {
		id: number,
		typeHandle: string,
		images: {
		  alt: string,
		  url: string,
		  height: number,
		  width: number,
		}
	}
}

const GalleryBlock = ( { block }: Props ) => {
	
	const images = block.images; 

	return (
		<BlockWrapper>
			{images && (
				<Swiper
					modules={[Navigation, Pagination]}
					spaceBetween={50}
					slidesPerView={1}
					navigation
					pagination={{ clickable: true }}
					// scrollbar={{ draggable: true }}
					// onSwiper={(swiper) => console.log(swiper)}
					// onSlideChange={}
					>
					{images.map((image, index) => {
						return(
							<>
								<SwiperSlide key={index}>
									<Image
										src={image.url}
										height={image.height}
										width={image.width}
										alt={image.alt}
										className=''
									/>
								</SwiperSlide>
							</>
						)
					})}

				</Swiper>
			)}
		</BlockWrapper>
	)
}

export default GalleryBlock
