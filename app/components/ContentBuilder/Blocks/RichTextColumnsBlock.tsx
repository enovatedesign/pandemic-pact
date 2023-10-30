import BlockWrapper from "../BlockWrapper"
import Image from "next/image"
import RichText from "../Common/RichText"
import ButtonLink from "../Common/Button"

type Props = {
    block: {
        columns: {
            id: number,
            button: {
              customText: string,
              url: string,
              text: string,
            }
            text: string,
            image: {
              width: number,
              url: string,
              height: number,
              alt: string,
            }
        }
    }
}


const RichTextColumnsBlock = ({block} : Props) => {
    
    const columns = block.columns ?? null

    const gridClasses = [
        'grid md:grid-cols-2 lg:grid-flow-col lg:auto-cols-fr',
        'gap-y-12 lg:gap-y-0',
        'md:gap-x-12',
    ].join(' ')

    return(
        <BlockWrapper>
            {columns && (
                <div className={gridClasses}>
                    {columns.map((column, index) => {
                        
                        const image = column.image[0] ?? null
                        const text = column.text ?? null
                        const button = column.button ?? null
                        return (
                            <>
                                <div className="flex flex-col space-y-6 items-start bg-white shadow-lg rounded-md" key={index}>
                                    {image && (
                                        <Image 
                                            src={image.url}
                                            height={image.height}
                                            width={image.width}
                                            alt={image.alt}
                                            className="rounded-t-md"
                                            loading='lazy'
                                        />
                                    )}

                                    <div className="p-6 flex flex-col justify-between h-full space-y-4 items-start">
                                        {text && (
                                            <RichText text={text} />
                                            )}

                                        {button.url && (
                                            <ButtonLink 
                                            linkTo={button.url}
                                            title={button.text}
                                            />
                                            )}
                                    </div>
                                </div>
                            </>
                        )
                    })}
                </div>
            )}
        </BlockWrapper>
    )
}

export default RichTextColumnsBlock