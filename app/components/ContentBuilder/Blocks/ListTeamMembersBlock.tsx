import Image from "next/image"
import BlockWrapper from "../BlockWrapper"

type Props = {
    block: {
        id: number,
        typeHandle: string,
        heading: string,
        customEntries: {
            title: string,
            jobTitle: string,
            postNominalLetters: string,
            thumbnailImage: {
              alt: string,
              url: string,
              height: number,
              width: number,
            }
          }
        }
    }

const ListTeamMembersBlock = ({block}: Props) => {

    const heading = block.heading ?? 'Meet the team'
    const customEntries = block.customEntries ?? null

    return (
        <BlockWrapper>
            <div className="flex flex-col space-y-8 lg:space-y-12">

                <h3 className="text-center text-4xl text-black uppercase">
                    {heading}
                </h3>
                
                <ul>
                    {customEntries.map((entry, index) => {
                        
                        const {title, jobTitle, postNominalLetters, thumbnailImage} = entry

                        return (
                            <>
                                <li key={index}>
                                    <Image 
                                        src={thumbnailImage[0].url}
                                        alt={thumbnailImage[0].alt}
                                        width={thumbnailImage[0].width}
                                        height={thumbnailImage[0].height}
                                        className=""
                                        loading="lazy"
                                    />
                                    <p>
                                        {title}
                                    </p>
                                    <p>
                                        {jobTitle}
                                    </p>
                                    <p>
                                        {postNominalLetters}
                                    </p>
                                </li>
                            </>
                        )
                    })}
                </ul>
            </div>
        </BlockWrapper>
    )
}

export default ListTeamMembersBlock