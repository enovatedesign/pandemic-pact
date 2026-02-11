import Image from "next/image"
import RichText from "../Common/RichText"
import Button from '../../Button'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from "swiper/modules"

import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';

type Props = {
    block: {
        heroImageSlides: {
            slideHeading: string,
            slideText: string,
            slideImage: {
                alt: string,
                url: string,
                width: number,
                height: number,
            }[],
            slideButton: {
                url: string,
                text: string,
            }[]
            slideTextLink: {
                url: string,
                text: string,
            }[]
        }[],
    }
}

const HeroImageSliderBlock = ({block}: Props) => {

    const slides = block.heroImageSlides ?? null
    const mastheadClasses = [
        'masthead-slider',
        'h-[24rem] sm:h-[28rem] md:h-[35rem] lg:h-[42rem]',
        'print:hidden',
        'overflow-hidden'
    ].join(' ')

    return (
        <section >
            {slides && (
                <Swiper className={`${mastheadClasses}`}
                    modules={[Pagination]}
                    slidesPerView={1}
                    pagination={slides.length > 1 ? { clickable: true } : false}
                    id="hero-image-slider-swiper"
                >
                    
                    {slides.map((slide, index) => {

                        const image = slide.slideImage[0] ?? null
                        const heading = slide.slideHeading ?? null
                        const text = slide.slideText ?? null
                        const button = slide.slideButton?.[0] ?? null
                        const textLink = slide.slideTextLink?.[0] ?? null

                        const Heading = index === 0 ? 'h1' : 'h2'

                        return(
                                <SwiperSlide key={index} className="relative w-full h-full bg-gray-100 overflow-hidden">

                                    <Image
                                        src={image.url}
                                        width={image.width}
                                        height={image.height}
                                        alt={image.alt}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />

                                    <div className="relative bg-black bg-opacity-60 w-full h-full lg:bg-transparent z-10">
                                        <div className="container flex h-full items-center">
                                            <div className="flex flex-col lg:w-1/2 lg:rounded-2xl lg:bg-black lg:bg-opacity-60 lg:p-10">
                                                {heading && (
                                                    <Heading className="text-2xl lg:text-3xl xl:text-5xl text-primary" id="page-title">
                                                        {heading}
                                                    </Heading>
                                                )}

                                                {text && (
                                                    <div className="pt-4 lg:pt-8">
                                                        <RichText text={text} invert={true} />
                                                    </div>
                                                )}

                                                {(button?.url || textLink?.url) && (
                                                    <ul className="mt-6 md:mt-8 flex flex-row items-center gap-4 lg:gap-6 list-none p-0">
                                                        {button?.url && (
                                                            <li>
                                                                <Button href={button.url} size="small">{button.text}</Button>
                                                            </li>
                                                        )}

                                                        {textLink?.url && (
                                                            <li>
                                                                <a href={textLink.url} className="text-white underline text-sm sm:text-base">{textLink.text}</a>
                                                            </li>
                                                        )}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                        )
                    })}
                </Swiper>
            )}
        </section>
    )
}

export default HeroImageSliderBlock