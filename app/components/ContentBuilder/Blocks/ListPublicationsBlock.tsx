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
        }[],
    }
}

const ListPublicationsBlock = ({block}: Props) => {

    const heading = block.heading ?? 'Publications'
    const customEntries = block.customEntries ?? null

    return (
        <>
            <BlockWrapper>
                {heading && (
                    <div className={`${defaultProseClasses.join(" ")} text-center mb-12`}>
                        <h2 dangerouslySetInnerHTML={{ __html: heading }}></h2>
                    </div>
                )}

                <ul className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    
                    {customEntries.map((entry, index: number) => {
                        return (
                            <Card entry={entry} key={index}>
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