import { ReactNode } from "react"
import BlockWrapper from "../BlockWrapper"
import Card from "../Common/Card"
import { defaultProseClasses } from '@/app/helpers/prose-classes'
import { ExternalLinkIcon, ChevronRightIcon } from '@heroicons/react/outline'

type Props = {
    block: {
        id: string,
        typeHandle: string,
        heading: string,
        customEntries: {
            id: number,
            title: string,
            summary: string,
            externalLink: string,
            postDate: number,
            thumbnailImage: {
                altText: string,
                height: number,
                url: string,
                width: number,
            }[],
            publicationType: string,
            dateCreated: any,
            typeHandle: string,
            uri: string,
        }[],
    }
}

const ListPublicationsBlock = ({block}: Props) => {

    const heading = block.heading ?? null
    const customEntries = block.customEntries ?? null

    return (
        <>
            <BlockWrapper>
                {heading && (
                    <div className={defaultProseClasses({ customClasses: 'text-center mb-12' })}>
                        <h2 dangerouslySetInnerHTML={{ __html: heading }}></h2>
                    </div>
                )}

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    
                    {customEntries.map((entry, index: number) => {

                        let cardData: any = {}
                        let icon: ReactNode

                        if (entry.typeHandle === 'externalPublication') {
                        
                            cardData = {
                                title: entry.title,
                                imageLabel: entry.publicationType,
                                summary: entry.summary,
                                summaryClasses: '',
                                url: entry.externalLink,
                                thumbnailImage: entry.thumbnailImage,
                                postDate: entry.postDate,
                            }

                            icon = <ExternalLinkIcon className="w-6 h-6" />

                        } else {

                            cardData = {
                                title: entry.title,
                                imageLabel: 'Pandemic PACT',
                                summary: entry.summary,
                                summaryClasses: '',
                                url: entry.uri,
                                thumbnailImage: entry.thumbnailImage,
                                postDate: entry.postDate,
                            }
                            
                            icon = <ChevronRightIcon className="w-6 h-6" />

                        }
                        
                        return (
                            <Card entry={cardData} key={index} animatedIcon={icon}/>
                        )
                    })}

                </div>
            </BlockWrapper>
        </>
    )
}

export default ListPublicationsBlock