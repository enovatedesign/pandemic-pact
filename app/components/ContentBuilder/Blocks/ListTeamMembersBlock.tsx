import Image from "next/image"
import BlockWrapper from "../BlockWrapper"
import { useInView, animated } from '@react-spring/web';
import { useState } from "react"
import TeamMembersModal from "./Team Members/TeamMembersModal"
import { defaultProseClasses } from '@/app/helpers/prose-classes'
import Card from "../Common/Card";

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
            <animated.div ref={ref} style={springs}>

                {heading && (
                    <div className={`${defaultProseClasses.join(" ")} text-center mb-12`}>
                        <h2 dangerouslySetInnerHTML={{ __html: heading }}></h2>
                    </div>
                )}

                <ul className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    
                    {customEntries.map((entry, index) => {

                        const handleOpen = () => {
                            setActiveIndex(index)
                            setIsOpen(true)
                        }
                    
                        const handleClose = () => {
                            setActiveIndex(-1)
                            setIsOpen(false)
                        }
                        
                        return (
                            <>
                                <Card entry={entry} index={index} handleOpen={handleOpen} handleClose={handleClose}/>    
                            </>
                        )
                    })}

                </ul>
            </animated.div>
        </BlockWrapper>
    )
}

export default ListTeamMembersBlock