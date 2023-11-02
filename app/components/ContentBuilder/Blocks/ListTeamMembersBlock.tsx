import Image from "next/image"
import BlockWrapper from "../BlockWrapper"
import { useState } from "react"
import TeamMembersModal from "./Team Members/TeamMembersModal"

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
    
    return (
        <BlockWrapper>
            <div className="flex flex-col space-y-8 lg:space-y-12">

                <h3 className="text-center text-4xl text-black uppercase">
                    {heading}
                </h3>

                <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
                    
                    {customEntries.map((entry, index) => {
                        
                        const {title, jobTitle, thumbnailImage} = entry

                        const handleOpen = () => {
                            setActiveIndex(index)
                            setIsOpen(true)
                    
                        }
                    
                        const handleClose = () => {
                            setActiveIndex(-1)
                            setIsOpen(false)
                        }
                        
                        return (
                            <li key={index} className=" bg-white shadow-xl hover:shadow-2xl rounded-lg hover:scale-105 transition duration-300 cursor-pointer" onClick={handleOpen}>
                                
                                <Image 
                                    src={thumbnailImage[0].url}
                                    alt={thumbnailImage[0].alt}
                                    width={thumbnailImage[0].width}
                                    height={thumbnailImage[0].height}
                                    className=" rounded-t-lg"
                                    loading="lazy"
                                />
                                <div className="space-y-4 p-4 xl:p-8">

                                    
                                    {title && (
                                        <h3 className="text-2xl md:text-3xl">
                                            {title}
                                        </h3>
                                    )}
                                    
                                    {jobTitle && (
                                        <p className="">
                                            {jobTitle}
                                        </p>
                                    )}

                                    <button onClick={handleOpen} className="rounded-md border-2 border-primary px-4 py-2 text-sm text-primary hover:bg-primary hover:text-white transition duration-300">
                                        Read more
                                    </button>
                                </div>
                                
                                {activeIndex === index && (
                                    <TeamMembersModal entry={entry} isOpen={isOpen} handleClose={handleClose}/>
                                )}
                            </li>
                        )
                    })}

                </ul>
            </div>
        </BlockWrapper>
    )
}

export default ListTeamMembersBlock