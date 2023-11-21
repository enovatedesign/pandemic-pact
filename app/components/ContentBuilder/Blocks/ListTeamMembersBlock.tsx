import Image from "next/image"
import BlockWrapper from "../BlockWrapper"
import { useInView, animated } from '@react-spring/web';
import { useState } from "react"
import TeamMembersModal from "./Team Members/TeamMembersModal"
import { defaultProseClasses } from '@/app/helpers/prose-classes'
import Card from "../Common/Card";
import Button from "../../Button";
import RichText from "../Common/RichText";

type Props = {
    block: {
        id: number,
        typeHandle: string,
        heading: string,
        summary: string,
        customEntries: {
            title: string,
            jobTitle: string,
            postNominalLetters: string,
            aboutText: string,
            thumbnailImage: {
              altText: string,
              url: string,
              height: number,
              width: number,
            }[],
          }[],
        }
    }

const ListTeamMembersBlock = ({block}: Props) => {

    const heading = block.heading ?? 'Meet the team'
    const summary = block.summary ?? null
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

                <div className="flex flex-col items-center space-y-4 pb-8">
                    {heading && (
                        <div className={`${defaultProseClasses.join(" ")}`}>
                            <h2 dangerouslySetInnerHTML={{ __html: heading }}></h2>
                        </div>
                    )}
                    
                    {summary && (
                        <RichText text={summary} customClasses="max-w-5xl text-center"/>
                    )}

                </div>

                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    
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
                            <div key={index}>
                                <Card
                                    entry={entry} tags={false} hover={false} >
                                    <Button 
                                        size="small"
                                        onClick={handleOpen}
                                    >
                                        read more
                                    </Button>
                                </Card>  
                                
                                {activeIndex === index && (
                                    <TeamMembersModal entry={entry} isOpen={isOpen} handleClose={handleClose}/>
                                )}
                            </div>
                        )
                    })}

                </div>
            </animated.div>
        </BlockWrapper>
    )
}

export default ListTeamMembersBlock