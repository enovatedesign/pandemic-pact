import BlockWrapper from "../BlockWrapper"
import Card from "../Common/Card"
import { defaultProseClasses } from '@/app/helpers/prose-classes'
import { ChevronRightIcon } from '@heroicons/react/outline'

type Props = {
    block: {
        id: string,
        typeHandle: string,
        heading: string,
        outbreakType: 'outbreak' | 'pastOutbreak'
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
            typeHandle: string
        }[],
    }
}

const ListOutbreaksBlock = ({ block }: Props) => {
    const { heading, outbreakType } = block
    const customEntries = block.customEntries.filter(entry => entry['typeHandle'] === outbreakType) ?? null

    return (
        <>
            <BlockWrapper>
                {heading && (
                    <div className={defaultProseClasses({ customClasses: 'text-center mb-12' })}>
                        <h2 dangerouslySetInnerHTML={{ __html: heading }}></h2>
                    </div>
                )}

                <ul className="flex flex-wrap justify-center gap-6">
                    {customEntries.map((entry, index: number) => {
                        const cardData = {
                            title: entry.title,
                            summary: entry.outbreakPending ? 'Pending' : entry.summary,
                            summaryClasses: '',
                            url: entry.outbreakPending ? null : `/${entry.uri}`,
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
                                    animatedIcon={<ChevronRightIcon className="w-6 h-6" />}
                                />
                            </li>
                        )
                    })}
                </ul>

            </BlockWrapper>
        </>
    )
}

export default ListOutbreaksBlock
