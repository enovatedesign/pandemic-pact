import { useState, useEffect } from 'react';
import BlockWrapper from '../BlockWrapper';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Pagination, Autoplay, EffectFade, Thumbs } from "swiper/modules"

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

const Gallery = ({images, autoplayState, thumbnailsOnlyState}) => {

    const [thumbsSwiper, setThumbsSwiper] = useState(null);

    const autoplayDelay = autoplayState ? 3000 : null

    return (    
		<div className="bg-gray-200">
			{images && (
                <BlockWrapper>
                    {thumbnailsOnlyState ? (
                        <div className='pt-8 lg:pt-12'>
                            <Swiper
                                spaceBetween={50}
                                breakpoints= {{
                                    500: {
                                        slidesPerView: 2,
                                        slidesPerGroup: 2,
                                        spaceBetween: 20,
                                    },
                                    768: {
                                        slidesPerView: 3,
                                        slidesPerGroup: 3,
                                        spaceBetween: 20,
                                    },
                                    992: {
                                        slidesPerView: 4,
                                        slidesPerGroup: 4,
                                        spaceBetween: 20,
                                    },
                                }}
                            >
                                {images.map((image, index) => {
                                    return (
                                        <SwiperSlide key={index}>
                                            <Image
                                                src={image.url}
                                                height={image.height}
                                                width={image.width}
                                                alt={image.altText}
                                                className='w-full'
                                            />
                                        </SwiperSlide>
                                    )
                                })}
                            </Swiper>
                        </div>
                    ) : (
                        <div className='pt-8 lg:pt-12'>
                            <Swiper
                                modules={[EffectFade, Navigation, Autoplay, Thumbs]}
                                spaceBetween={10}
                                slidesPerView={1}
                                navigation={true}
                                thumbs={{swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null}}
                                effect="fade"
                                autoplay={ autoplayState ?  { delay: autoplayDelay } : false }
                            >
                                {images.map((image, index) => {
                                    return (
                                        <SwiperSlide key={index}>
                                            <Image
                                                src={image.url}
                                                height={image.height}
                                                width={image.width}
                                                alt={image.altText}
                                                className="w-full"
                                            />
                                        </SwiperSlide>
                                    )
                                })}
                            </Swiper>
                            <Swiper
                                onSwiper={setThumbsSwiper}
                                loop={true}
                                modules={[FreeMode, Navigation, Thumbs]}
                                spaceBetween={30}
                                slidesPerView={4}
                                watchSlidesProgress={true}
                                freeMode={true}
                                className='mySwiper mt-8'
                            >
                                {images.map((image, index) => {
                                    return(
                                        <SwiperSlide key={index}>
                                            <Image
                                                src={image.url}
                                                height={image.height}
                                                width={image.width}
                                                alt={image.altText}
                                                className="cursor-pointer mx-auto shadow-lg transition duration-300 overflow-hidden bg-gray-200"
                                            />
                                        </SwiperSlide>
                                    )
                                })}
                            </Swiper>
                        </div>
                        
                    )}

                </BlockWrapper>
			)}
		</div>
	)
}

export default Gallery
