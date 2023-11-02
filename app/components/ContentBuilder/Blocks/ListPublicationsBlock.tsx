import Image from "next/image"
import BlockWrapper from "../BlockWrapper"

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
                alt: string,
                height: number,
                url: string,
                width: number,
            }
        }
    }
}

const ListPublicationsBlock = ({block}: Props) => {

    const heading = block.heading ?? 'Publications'
    const customEntries = block.customEntries ?? null

    return (
        <>
            <BlockWrapper>
                <div className="flex flex-col space-y-8 lg:space-y-12">

                    <h3 className="text-center text-4xl text-black uppercase">
                        {heading}
                    </h3>

                    <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
                        
                        {customEntries.map((entry, index) => {
                            
                            const {title, summary, thumbnailImage, externalLink} = entry

                            return (
                                <li key={index}  className="bg-white shadow-xl hover:shadow-2xl rounded-lg hover:scale-105 transition duration-300 cursor-pointer">
                                    <a href={externalLink} target="_blank">
                                        <Image 
                                            src={thumbnailImage[0].url}
                                            alt={thumbnailImage[0].alt}
                                            width={thumbnailImage[0].width}
                                            height={thumbnailImage[0].height}
                                            className=" rounded-t-lg"
                                            loading="lazy"
                                        />
                                        <div className="space-y-4 p-4 xl:p-8">
                                            <h3 className="text-lg">
                                                {title}
                                            </h3>
                                            <p>
                                                {summary}
                                            </p>
                                        </div>
                                    </a>
                                </li>
                            )
                        })}

                    </ul>
                </div>
            </BlockWrapper>
        </>
    )
}

export default ListPublicationsBlock