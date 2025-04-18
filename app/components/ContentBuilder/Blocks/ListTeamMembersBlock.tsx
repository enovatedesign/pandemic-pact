import BlockWrapper from "../BlockWrapper"
import { defaultProseClasses } from '@/app/helpers/prose-classes'
import Card from "../Common/Card";
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

    const heading = block.heading ?? null
    const summary = block.summary ?? null
    const customEntries = block.customEntries ?? null
    
    return (
        <BlockWrapper>

                <div className="flex flex-col items-center pb-8 space-y-4">
                    {heading && (
                        <div className={defaultProseClasses({ })}>
                            <h2 dangerouslySetInnerHTML={{ __html: heading }}></h2>
                        </div>
                    )}
                    
                    {summary && (
                        <RichText text={summary} customClasses="max-w-5xl text-center"/>
                    )}

                </div>

                <ul className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    
                    {customEntries.map((entry, index) => {

                        const cardData = {
                            title: entry.title,
                            summary: entry.jobTitle,
                            summaryClasses: 'text-lg font-bold',
                            thumbnailImage: entry.thumbnailImage,
                        }

                        return (
                            <li key={index}>
                                <Card entry={cardData} />
                            </li>
                        )
                    })}

                </ul>
        </BlockWrapper>
    )
}

export default ListTeamMembersBlock
