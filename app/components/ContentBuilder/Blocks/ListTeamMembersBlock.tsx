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

    const heading = block.heading ?? 'Meet the team'
    const summary = block.summary ?? null
    const customEntries = block.customEntries ?? null
    
    return (
        <BlockWrapper>

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

                        const cardData = {
                            title: entry.title,
                            summary: entry.jobTitle,
                            summaryClasses: 'text-lg font-bold',
                            thumbnailImage: entry.thumbnailImage,
                        }

                        return (
                            <>
                                <div key={index}>
                                    <Card
                                        entry={cardData} 
                                        tags={false} 
                                        hover={false} 
                                    >
                                    </Card>  
                                </div>
                            </>
                        )
                    })}

                </div>
        </BlockWrapper>
    )
}

export default ListTeamMembersBlock