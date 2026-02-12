import {useState, useEffect, useRef} from 'react'
import {ChevronDownIcon} from '@heroicons/react/solid'
import Image from "next/image"
import AnimateHeight from 'react-animate-height';
import { DiseaseLabel } from '../helpers/types';
import { VisualisationCardDataProps, HundredDaysMissionCardDataProps } from '../visualise/components/visualisationCardData';

interface Props {
    disease?: DiseaseLabel
    cardData: VisualisationCardDataProps[] | HundredDaysMissionCardDataProps[]
}

export default function JumpMenu({cardData, disease}: Props) {

    const [isOpen, setIsOpen] = useState<Boolean>(false)

    const dropdown = useRef<HTMLLIElement>(null)

    useEffect(() => {
        const handleDocumentClick = (e: any) => {
            if (!dropdown.current?.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("click", handleDocumentClick)

        return () => {
            document.removeEventListener('click', handleDocumentClick)
        }
    })
    
    return (
        <div className="container py-2">
            <span className="sr-only">Jump to a visualisation on this page</span>
            <div className="relative w-full text-center sm:text-right">
                <button onClick={() => setIsOpen(true)} className="inline-flex items-center rounded-full bg-primary uppercase py-2 px-4 hover:bg-primary-darker focus:bg-primary-darker focus:outline-none">
                    <span className="text-xs sm:text-sm font-medium">
                        Jump to a visualisation collection
                    </span>
                    <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                </button>

                {cardData && (
                    <div className="absolute right-0 left-0 z-10 mt-2 lg:max-w-5xl lg:left-auto origin-top-right bg-white rounded-b-lg shadow-2xl">
                        <AnimateHeight
                            duration={300}
                            height={isOpen ? 'auto' : 0}
                        >
                            <ul className="grid grid-cols-3 md:grid-cols-4 gap-1 lg:gap-2 p-2 lg:p-4">
                                {cardData.filter(card => card.url).map((card: any, index: number) => {
                                    const { title, image } = card
                                    const cardSwitch: DiseaseLabel = disease ?? 'default'
                                    const url = card.url[cardSwitch]
                                    
                                    return card.showCard[cardSwitch as keyof typeof card.showCard] && (
                                        <li ref={dropdown}
                                            key={index}
                                            className="transition-colors duration-300 p-2 rounded-lg h-full hover:bg-primary-lightest"
                                        >
                                            <a href={url}>
                                                <button className="h-full flex flex-col" onClick={() => setIsOpen(false)}>
                                                    {image && (
                                                        <Image
                                                            src={image.url}
                                                            alt={image.altText}
                                                            width={image.width}
                                                            height={image.height}
                                                            className="w-full rounded-lg aspect-square"
                                                            loading="lazy"
                                                        />
                                                    )}
                                                    {title && (
                                                        <div className="h-full flex items-center py-2">
                                                            <span className="block text-sm xl:text-base text-center w-full">
                                                                {title}
                                                            </span>
                                                        </div>
                                                    )}
                                                </button>
                                            </a>
                                        </li>
                                    )
                                })}
                            </ul>
                        </AnimateHeight>
                    </div>
                )}
            </div>
        </div>
    );
}
