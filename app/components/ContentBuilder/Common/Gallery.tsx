import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade, Thumbs } from "swiper/modules"
import "swiper/css/bundle"

const Gallery = ({images, autoplayState, thumbnailsOnlyState}) => {

	const { url, alt, height, width } = images

    const autoplayDelay = autoplayState ? 3000 : null

    return (    
		<div>
			{images && (
                <div>
                    {thumbnailsOnlyState ? (
                        <p>
                        test
                        </p>
                    ) : (
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            spaceBetween={50}
                            slidesPerView={1}
                            navigation
                            autoplay={ autoplayState ?  { delay: autoplayDelay } : false }
                            pagination={{ clickable: true }}
                            // onSwiper={(swiper) => console.log(swiper)}
                            // onSlideChange={() => console.log('slide change')}
                        >
                            {images.map((image, index) => {
                                return(
                                    <SwiperSlide key={index}>
                                        <Image
                                            src={image.url}
                                            height={image.height}
                                            width={image.width}
                                            alt={image.alt}
                                            className=''
                                        />
                                    </SwiperSlide>
                                )
                            })}

                        </Swiper>
                    )}

                </div>
			)}
		</div>
	)
}

export default Gallery
