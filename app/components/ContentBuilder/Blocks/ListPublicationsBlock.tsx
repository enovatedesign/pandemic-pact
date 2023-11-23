import BlockWrapper from "../BlockWrapper"
import Card from "../Common/Card"
import { defaultProseClasses } from '@/app/helpers/prose-classes'
import Button from "../../Button"

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
            thumbnailImage: {
                altText: string,
                height: number,
                url: string,
                width: number,
            }[],
            publicationType: string,
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
                    <div className={`${defaultProseClasses.join(" ")} text-center mb-12`}>
                        <h2 dangerouslySetInnerHTML={{ __html: heading }}></h2>
                    </div>
                )}

                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    
                    {customEntries.map((entry, index: number) => {

                        const cardData = {
                            title: entry.title,
                            imageLabel: entry.publicationType,
                            summary: entry.summary,
                            summaryClasses: '',
                            url: entry.externalLink,
                            thumbnailImage: entry.thumbnailImage,
                        }

                        return (
                            <Card entry={cardData} key={index}>
                                <Button 
                                    href={entry.externalLink}
                                    size="small"
                                >
                                    Read More
                                </Button>
                            </Card>

                        )
                    })}

                </ul>
            </BlockWrapper>
        </>
    )
}

export default ListPublicationsBlock