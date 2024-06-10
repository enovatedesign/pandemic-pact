import BlockWrapper from "../BlockWrapper"
import Card from "../Common/Card"
import { defaultProseClasses } from '@/app/helpers/prose-classes'
import { ChevronRightIcon } from '@heroicons/react/outline'

type Props = {
    block: {
        id: string,
        typeHandle: string,
        heading: string,
        customEntries: {
            id: number,
            title: string,
            summary: string,
            outbreakPending: boolean,
            uri: string,
            thumbnailImage: {
                altText: string,
                height: number,
                url: string,
                width: number,
            }[],
        }[],
    }
}

const ListOutbreaksBlock = ({block}: Props) => {

    const heading = block.heading ?? null
    const customEntries = block.customEntries ?? null

    return (
        <>
            <BlockWrapper>
                {heading && (
                    <div className={`${defaultProseClasses} text-center mb-12`}>
                        <h2 dangerouslySetInnerHTML={{ __html: heading }}></h2>
                    </div>
                )}

                <div className="mx-auto">

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        
                        {customEntries.map((entry, index: number) => {
                            
                            const cardData = {
                                title: entry.title,
                                summary: entry.outbreakPending ? 'Pending' : entry.summary,
                                summaryClasses: '',
                                url: entry.outbreakPending ? null : `/${entry.uri}`,
                                thumbnailImage: entry.thumbnailImage,
                            }
                            
                            return (
                                <Card entry={cardData} key={index} animatedIcon={<ChevronRightIcon className="w-6 h-6" />}/>
                            )
                        })}

                    </div>

                </div>
            </BlockWrapper>
        </>
    )
}

export default ListOutbreaksBlock