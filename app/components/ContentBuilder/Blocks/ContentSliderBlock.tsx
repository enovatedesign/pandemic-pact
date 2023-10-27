import BlockWrapper from "../BlockWrapper"
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation} from "swiper/modules"
import "swiper/css/bundle"
import RichText from "../Common/RichText";
import ButtonLink from "../Common/Button";

type Props = {
    block: {
        slides: {
            text: string,
            button: {
                text: string,
                url: string,
            }
            image: {
                width: number,
                url: string,
                height: number,
                alt: string,
            }
       }
    }
}

const ContentSliderBlock = ({block}: Props ) => {

    const slides = block.slides ?? null

    return (
        <BlockWrapper>
            {slides && (
                <Swiper
                    modules={[Navigation]}
                    spaceBetween={50}
                    slidesPerView={3}
                    navigation
                >
                    {slides.map((slide, index) => {
                        
                        const text= slide.text ?? null
                        const button = slide.button ?? null
                        const image = slide.image[0] ?? null

                        return (
                            <>
                                <SwiperSlide key={index}>
                                    <div className='flex flex-col space-y-6'>
                                        {image && (    
                                            <Image 
                                                src={image.url}
                                                width={image.width}
                                                height={image.height}
                                                alt={image.alt}
                                                className=""
                                            />
                                        )}

                                        {text && (
                                            <RichText text={text}/>
                                        )}

                                        {button.url && (
                                            <ButtonLink 
                                                linkTo={button.url}
                                                title={button.text}
                                            />
                                        )}
                                    </div>
                                </SwiperSlide>
                            </>
                        )
                    })}
                </Swiper>
            )}
        </BlockWrapper>
    )
}

export default ContentSliderBlock