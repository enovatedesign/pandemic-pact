import { defaultProseClasses } from "@/app/helpers/prose-classes"
import { ChevronRightIcon } from "@heroicons/react/outline"

import BlockWrapper from "../BlockWrapper"
import Card from "../Common/Card"

type Props = {
    block: {
        id: string
        typeHandle: string
        heading: string
        comingSoonOnly: boolean
        customEntries: {
            id: number
            title: string
            richTextSummary: string
            uri: string
            comingSoon: boolean
            thumbnailImage: {
                altText: string
                height: number
                url: string
                width: number
            }[]
            typeHandle: string
        }[]
    }
}


const ListPolicyRoadmapsBlock = ({ block }: Props) => {
    const { heading, comingSoonOnly } = block
    
    const customEntries = block.customEntries
        .filter(entry => 
            entry['comingSoon'] === comingSoonOnly
        )

    return (customEntries && (customEntries.length > 0)) && (
        <BlockWrapper>
            {heading && (
                <div
                    className={defaultProseClasses({
                        customClasses: "text-center mb-12",
                    })}
                >
                    <h2 dangerouslySetInnerHTML={{ __html: heading }}></h2>
                </div>
            )}

            <ul className="flex flex-wrap justify-center gap-6">
                {customEntries.map((entry, index: number) => {
                    const cardData = {
                        title: entry.title,
                        summary: null,
                        summaryClasses: "",
                        url: !comingSoonOnly ? `/${entry.uri}` : null,
                        thumbnailImage: entry.thumbnailImage,
                    }

                    return (
                        <li
                            key={entry.id}
                            className="basis-full sm:basis-[calc(50%_-_(theme('spacing.6')/2))] lg:basis-[calc((100%/3)_-_((theme('spacing.6')*2)/3))] xl:basis-[calc(25%_-_((theme('spacing.6')*3)/4))]"
                        >
                            <Card
                                entry={cardData}
                                key={index}
                                animatedIcon={ !comingSoonOnly ? 
                                    <ChevronRightIcon className="w-6 h-6" /> : 
                                    null
                                }
                            />
                        </li>
                    )
                })}
            </ul>
        </BlockWrapper>
    )
}

export default ListPolicyRoadmapsBlock
