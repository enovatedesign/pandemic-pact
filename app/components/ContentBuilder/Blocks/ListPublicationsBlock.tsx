import BlockWrapper from "../BlockWrapper"
import Card from "../Common/Card"
import { defaultProseClasses } from '@/app/helpers/prose-classes'
import { ExternalLinkIcon } from '@heroicons/react/outline'

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
                        
                        const cardData = {
                            title: entry.title,
                            imageLabel: entry.publicationType,
                            summary: entry.summary,
                            summaryClasses: '',
                            url: entry.externalLink,
                            thumbnailImage: entry.thumbnailImage,
                            postDate: entry.postDate
                        }
                        
                        return (
                            <Card entry={cardData} key={index} animatedIcon={<ExternalLinkIcon className="w-6 h-6" />}/>
                        )
                    })}

                </div>
            </BlockWrapper>
        </>
    )
}

export default ListPublicationsBlock