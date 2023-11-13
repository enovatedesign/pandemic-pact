import Image from "next/image"
import RichText from "../Common/RichText"
import ButtonLink from "../Common/Button"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectFade } from "swiper/modules"

import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/effect-fade';
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
            }
            slideTextLink: {
                url: string,
                text: string,
            }
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
                    modules={[EffectFade, Autoplay, Pagination]}
                    slidesPerView={1}
                    effect="fade"
                    pagination={slides.length > 1 ? true : false}
                    autoplay={{ delay: 5000 }}
                >
                    
                    {slides.map((slide, index) => {

                        const image = slide.slideImage[0] ?? null
                        const heading = slide.slideHeading ?? null
                        const text = slide.slideText ?? null
                        const button = slide.slideButton ?? null
                        const textLink = slide. slideTextLink ?? null

                        const buttonContainerClasses = [
                            button.url || textLink.url ? "mt-6 md:mt-8 flex flex-row items-center gap-4" : ""
                        ].join(' ')

                        return(
                            <>
                                <SwiperSlide key={index} className="relative w-full h-full bg-gray-100 overflow-hidden">
                                    
                                    <div className="absolute">
                                        <Image
                                            src={image.url}
                                            width={image.width}
                                            height={image.height}
                                            alt={image.alt}
                                            className=""
                                        />  
                                    </div>

                                    <div className="relative bg-black bg-opacity-60 w-full h-full lg:bg-transparent z-10">
                                        <div className="container h-full">
                                            <div className="flex h-full items-center lg:w-1/2">
                                                <div className="lg:rounded lg:bg-black lg:bg-opacity-60 lg:p-10">
                                                    <div className="flex flex-col">
                                                        {heading && (
                                                            <>
                                                                {index === 0 ? (
                                                                    <h1 className="text-2xl lg:text-3xl xl:text-5xl text-primary" id="page-title">
                                                                        {heading}
                                                                    </h1>
                                                                ) : (

                                                                    <h2 className="text-2xl lg:text-3xl xl:text-5xl text-primary" id="page-title">
                                                                        { heading }
                                                                    </h2>
                                                                )}
                                                            </>
                                                        )}

                                                        {text && (
                                                            <div className="pt-4 lg:pt-8">
                                                                <RichText text={text} customClasses='text-white' />
                                                            </div>
                                                        )}


                                                        <div className={buttonContainerClasses}>
                                                            {button.url && (
                                                                <ButtonLink linkTo={button.url} title={button.text}/>
                                                            )}

                                                            {textLink.url && (
                                                                <li><a href={textLink.url} className="text-white underline text-sm sm:text-base">{ textLink.text }</a></li>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            </>
                        )
                    })}
                </Swiper>
            )}
        </section>
    )
}

export default HeroImageSliderBlock