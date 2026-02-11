import Button from "../../Button"
import BlockWrapper from "../BlockWrapper"
import Card from "../Common/Card"

type Props = {
    block: {
        columns: {
            id: number,
            button: {
                newWindow: boolean
              url: string,
              text: string,
            }[]
            text: string,
            image: {
              width: number,
              url: string,
              height: number,
              altText: string,
            }[],
        }[],
    }
}

const RichTextColumnsBlock = ({block} : Props) => {
    const columns = block.columns ?? null

    const gridClasses = [
        'grid md:grid-cols-2 lg:grid-flow-col lg:auto-cols-fr',
        'gap-y-12 lg:gap-y-0',
        columns.length > 2 ? 'md:gap-x-12' : 'md:gap-x-12 lg:gap-x-24',
    ].join(' ')

    return(
        <BlockWrapper options={{ fill: true }}>
            {columns && (
                <div className={gridClasses}>
                    {columns.map((column, index: number) => {
                        const button = column.button[0] ?? null
                        const buttonText = button?.text ?? 'Read more'
                        console.log(button)
                        return (
                            <Card 
                                entry={column} 
                                image={column.image[0]} 
                                key={index}
                                customImageClasses="aspect-video object-cover w-full"
                                cardBottomContent={button?.url && <Button size="small" href={button?.url && button.url}>{buttonText}</Button>}
                            />
                        )
                    })}
                </div>
            )}
        </BlockWrapper>
    )
}

export default RichTextColumnsBlock
