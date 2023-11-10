import Button from "../../Button"
import BlockWrapper from "../BlockWrapper"
import Card from "../Common/Card"

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
                        
                        const button = column.button ?? null

                        return (
                            <>
                                <Card entry={column} image={column.image[0]}>
                                    {button?.url && (
                                        <Button 
                                            size="small"
                                            href={button.url}
                                        >
                                            Read more
                                        </Button>
                                    )}
                                </Card>
                            </>
                        )
                    })}
                </div>
            )}
        </BlockWrapper>
    )
}

export default RichTextColumnsBlock