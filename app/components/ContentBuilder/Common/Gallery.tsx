import {useState, useEffect} from 'react';
import BlockWrapper from '../BlockWrapper';
import Image from 'next/image';
import {Swiper, SwiperSlide} from 'swiper/react';
import {FreeMode, Navigation, Pagination, Autoplay, EffectFade, Thumbs} from "swiper/modules"
import {Swiper as SwiperType} from "swiper/types"
import '/app/css/components/swiper.css'

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

interface Props {
    images: any[],
    autoplayState: boolean,
    thumbnailsOnlyState: boolean,
}

interface ImageProps {
    width: number,
    height: number,
    altText: string,
    url: string
}

const Gallery = ({images, autoplayState, thumbnailsOnlyState}: Props) => {

    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType>();
    const autoplayDelay = autoplayState ? 3000 : 0
    
    return (
        <div className="bg-gray-200">
            {images && (
                <BlockWrapper options={{fill: true}}>
                    {thumbnailsOnlyState ? (
                        <div className='pt-8 lg:pt-12'>
                            <Swiper
                                spaceBetween={10}
                                breakpoints={{
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
                                {images.map((image: ImageProps, index: number) => {
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
                        <div>
                            <Swiper
                                modules={[EffectFade, Navigation, Autoplay, Thumbs]}
                                spaceBetween={10}
                                slidesPerView={1}
                                navigation={true}
                                thumbs={{swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null}}
                                effect="fade"
                                autoplay={autoplayState ? {delay: autoplayDelay} : false}
                                id="gallery-swiper"
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
                                spaceBetween={10}
                                slidesPerView={4.5}
                                breakpoints={{
                                    768: {
                                        slidesPerView: 6.5,
                                    },
                                }}
                                watchSlidesProgress={true}
                                freeMode={true}
                                className='mySwiper mt-2.5'
                            >
                                {images.map((image, index) => {
                                    return (
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
