import {useState, useEffect, useRef} from 'react'
import {ChevronDownIcon} from '@heroicons/react/solid'
import Image from "next/image"
import AnimateHeight from 'react-animate-height';
import { DiseaseLabel } from '../helpers/types';

interface Props {
    disease?: DiseaseLabel
    cardData: {
        title?: string,
        image?: {
            url?: string,
            altText?: string,
            height?: number,
            width?: number,
        },
        id?: string,
        url?: {
            "Mpox": string
             "Pandemic-prone influenza": string
             "default": string 
         } | string 
    }[]
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
        <div className="container mx-auto h-[50px] flex justify-end items-center">
            <span className="sr-only">Jump to a visualisation on this page</span>
            <div className="relative">
                <div className="inline-flex">
                    <button onClick={() => setIsOpen(true)} className="inline-flex items-center rounded-full bg-primary uppercase py-2 px-4 hover:bg-primary-darker focus:bg-primary-darker focus:outline-none">
                        <span className="text-sm font-medium">
                            Jump to a visualisation collection
                        </span>
                        <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>


                {cardData && (
                    <div className="absolute right-0 z-10 mt-2 w-80 lg:w-96 origin-top-right bg-white rounded-b-lg shadow-2xl">
                        <AnimateHeight
                            duration={300}
                            height={isOpen ? 'auto' : 0}
                        >
                            <ul className="grid grid-cols-2 gap-2 p-4">

                                {cardData.filter(card => card.url).map((card: any, index: number) => {
                                    
                                    const cardSwitch: DiseaseLabel = disease ?? 'default'

                                    const {title, image} = card

                                    const url = disease ? card.url[cardSwitch] : card.url

                                    return (
                                        <li ref={dropdown}
                                            key={index}
                                            className="transition-colors duration-300 p-2 rounded-lg h-full hover:bg-primary-lightest"
                                        >
                                            <a href={url}>
                                                <button onClick={() => setIsOpen(false)}>
                                                    {image && (
                                                        <Image
                                                            src={image.url}
                                                            alt={image.altText}
                                                            width={image.width}
                                                            height={image.height}
                                                            className="w-full rounded-lg"
                                                            loading="lazy"
                                                        />
                                                    )}
                                                    {title && (
                                                        <p className="text-left pt-4">
                                                            {title}
                                                        </p>
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
