import BlockWrapper from "../BlockWrapper"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from "swiper/modules"
import "swiper/css/bundle"
import Card from "../Common/Card";
import Button from "../../Button";

type Props = {
    block: {
        slides: {
            text: string,
            button: {
                text: string,
                url: string,
            }
            image: {
                url: string,
                altText: string,
                width: number,
                height: number,
            }[],
       }[],
    }
}

const ContentSliderBlock = ({block}: Props ) => {

    const slides = block.slides ?? null

    return (
        <BlockWrapper
        >
            <div className="relative lg:px-20">
                {slides && (
                    <Swiper
                        modules={[Navigation, Pagination]}
                        spaceBetween={30}
                        breakpoints={{
                            640: {
                                slidesPerView: 2,
                            },
                            1024: {
                                slidesPerView: 3,
                            },
                        }}
                        navigation
                        pagination
                        id="content-slider-swiper"
                    >
                        {slides.map((slide, index: number) => {
                            
                            const button = slide.button ?? null

                            return (
                                <>
                                    <SwiperSlide key={index}>
                                        <Card entry={slide} image={slide.image[0]} hover={false}>
                                            {button?.url && (
                                                <Button
                                                    size="small"
                                                    href={button.url}
                                                >
                                                    Read more
                                                </Button>
                                            )}
                                        </Card>
                                    </SwiperSlide>
                                </>
                            )
                        })}
                    </Swiper>
                )}
            </div>
        </BlockWrapper>
    )
}

export default ContentSliderBlock