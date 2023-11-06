import Image from "next/image"
import BlockWrapper from "../BlockWrapper"
import { useInView, animated } from '@react-spring/web';
import { useState } from "react"
import TeamMembersModal from "./Team Members/TeamMembersModal"
import { defaultProseClasses } from '@/app/helpers/prose-classes'

type Props = {
    block: {
        id: number,
        typeHandle: string,
        heading: string,
        customEntries: {
            title: string,
            jobTitle: string,
            postNominalLetters: string,
            aboutText: string,
            thumbnailImage: {
              alt: string,
              url: string,
              height: number,
              width: number,
            }
          }
        }
    }

const ListTeamMembersBlock = ({block}: Props) => {

    const heading = block.heading ?? 'Meet the team'
    const customEntries = block.customEntries ?? null

    const [isOpen, setIsOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)

    const [ref, springs] = useInView(
        () => ({
            from: {
                opacity: 0,
                y: 100,
            },
            to: {
                opacity: 1,
                y: 0,
            },
        }),
        {
            once: true,
        }
    );
    
    return (
        <BlockWrapper>
            <animated.div className="flex flex-col space-y-8 lg:space-y-12" ref={ref} style={springs}>

                {heading && (
                    <div className={`${defaultProseClasses.join(" ")} text-center mb-12`}>
                        <h2 dangerouslySetInnerHTML={{ __html: heading }}></h2>
                    </div>
                )}

                <ul className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    
                    {customEntries.map((entry, index) => {
                        
                        const {title, jobTitle, thumbnailImage, postNominalLetters} = entry

                        const handleOpen = () => {
                            setActiveIndex(index)
                            setIsOpen(true)
                        }
                    
                        const handleClose = () => {
                            setActiveIndex(-1)
                            setIsOpen(false)
                        }
                        
                        return (
                            <li key={index} className="flex flex-col bg-white border-2 border-gray-200 hover:shadow-lg rounded-2xl overflow-hidden hover:scale-105 transition duration-300 cursor-pointer" onClick={handleOpen}>
                                
                                <Image 
                                    src={thumbnailImage[0].url}
                                    alt={thumbnailImage[0].alt}
                                    width={thumbnailImage[0].width}
                                    height={thumbnailImage[0].height}
                                    loading="lazy"
                                />
                                <div className="flex flex-col gap-3 p-6 h-full">
                                    
                                    {title && (
                                        <h3 className="text-xl md:text-2xl">
                                            {title}
                                            {postNominalLetters && (<span className="block text-base text-gray-500">{postNominalLetters}</span>)}
                                        </h3>
                                    )}
                                    
                                    {jobTitle && (
                                        <p className="text-lg font-bold">
                                            {jobTitle}
                                        </p>
                                    )}

                                    <p className="mt-auto self-end">
                                        <button onClick={handleOpen} className="mt-2 rounded-md border-2 border-primary px-4 py-2 text-sm text-primary hover:bg-primary hover:text-white transition duration-300">
                                            Read more
                                        </button>
                                    </p>
                                </div>
                                
                                {activeIndex === index && (
                                    <TeamMembersModal entry={entry} isOpen={isOpen} handleClose={handleClose}/>
                                )}
                            </li>
                        )
                    })}

                </ul>
            </animated.div>
        </BlockWrapper>
    )
}

export default ListTeamMembersBlock