import BlockWrapper from "../BlockWrapper"
import NewsCard from "../News/NewsCard.js"


const ListContentNewsBlock = ( {block} ) => {
    
    const customEntries = block.customEntries ?? null

    return(
        <>
            <BlockWrapper>
                <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {customEntries.map((entry, index) => {
                        return (
                            <>
                                <NewsCard entry={entry} key={index}/>
                            </>
                        )
                    })}
                </ul>
            </BlockWrapper>
        </>
    )
}

export default ListContentNewsBlock