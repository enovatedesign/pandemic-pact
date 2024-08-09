"use client"

import { useEffect, useState } from "react"
import BlockWrapper from "../BlockWrapper"
import Card from "../Common/Card"
import { ChevronDownIcon } from "@heroicons/react/outline"
import { formatId } from "@/app/helpers/value-formatters"

interface JumpCardProps {
    block: {
        jumpCards: {
            heading: string
            summary: string
            image: {
                width: number
                height: number
                url: string
                altText: string
            }[]
            jumpCardId: string
        }[]
    }
}

const JumpCardsBlock = ({block}: JumpCardProps) => {
    const jumpCards = block.jumpCards
    
    const [availableElements, setAvailableElements] = useState<Record<string, HTMLElement>>({})

    useEffect(() => {
        const elementsObject: Record<string, HTMLElement> = {};

        jumpCards.forEach(card => {
            const formattedId = formatId(card.jumpCardId)
            const element = document.getElementById(formattedId)
            
            if (!element) {
                console.warn(`Element ID: ${formattedId}, does not exist within the page.`);
                return 
            } else if (formattedId in elementsObject) {
                console.warn(`Duplicate ID found: ${formattedId}, jump card destination IDs must be unique within the context of the current page.`)
                return
            } else {
                elementsObject[formattedId] = element
            }
        })

        setAvailableElements(elementsObject)
    }, [jumpCards])

    return (
            <BlockWrapper options={{ fill: true, bgColourClass: '' }}>
                <ul className="flex flex-wrap justify-center gap-6">
                    {jumpCards.map((card, index: number) => {
                        const {heading, summary, jumpCardId} = card
                        const id = formatId(jumpCardId)

                        const image = card.image[0] ?? null
                        
                        const entry = {
                            url: `#${id}`,
                            title: heading,
                            summary: summary
                        }

                        return (
                            <li 
                                key={id}
                                className="basis-full sm:basis-[calc(50%_-_(theme('spacing.6')/2))] lg:basis-[calc((100%/3)_-_((theme('spacing.6')*2)/3))] 2xl:basis-[calc(20%_-_((theme('spacing.6')*4)/5))]"
                            >
                                {availableElements[id] && (
                                    <Card
                                        entry={entry}
                                        tags={false}
                                        image={image}
                                        animatedIcon={<ChevronDownIcon className="w-6 h-6"/>}
                                    />
                                )}
                            </li>
                        )
                    })}
                </ul>
            </BlockWrapper>
    )
}

export default JumpCardsBlock
