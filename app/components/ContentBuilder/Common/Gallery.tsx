import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules"
import "swiper/css/bundle"

const Gallery = ({images}) => {

	const { url, alt, height, width } = images

	return (
		<div>
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
		</div>
	)
}

export default Gallery
