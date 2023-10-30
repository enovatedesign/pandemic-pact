import BlockWrapper from '../BlockWrapper';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, Thumbs, Controller } from "swiper/modules"
import "swiper/css/bundle"
import { useState, useRef, useEffect } from 'react';


const Gallery = ({images, autoplayState, thumbnailsOnlyState}) => {

	const { url, alt, height, width } = images

    const autoplayDelay = autoplayState ? 3000 : null

    return (    
		<div className="bg-gray-200">
			{images && (
                <BlockWrapper>
                    {thumbnailsOnlyState ? (
                        <div className='pt-8 lg:pt-12'>
                            <Swiper
                                modules={[Thumbs, Pagination]}
                                watchSlidesProgress
                                spaceBetween={50}
                                slidesPerView={4}
                                pagination={{ clickable: true }}
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
                        </div>
                    ) : (
                        <div>
                            <Swiper
                                modules={[Navigation, Autoplay, Thumbs]}
                                spaceBetween={50}
                                slidesPerView={1}
                                navigation
                                autoplay={ autoplayState ?  { delay: autoplayDelay } : false }
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
                            <Swiper
                                modules={[Thumbs, Controller]}
                                watchSlidesProgress
                                spaceBetween={30}
                                slidesPerView={4}
                                className='mt-8'
                            >
                                {images.map((image, index) => {

                                    return(
                                        <SwiperSlide key={index}
                                        >
                                            <Image
                                                src={image.url}
                                                height={image.height}
                                                width={image.width}
                                                alt={image.alt}
                                                className='cursor-pointer'
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
