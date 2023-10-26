import BlockWrapper from "../BlockWrapper"


const NewsCard = ({
    title
}) => {
    return (
        <div>
            {title}
        </div>
    )
};

const ListContentNewsBlock = ({block}) => {
    
    const customEntries = block.customEntries ?? null

    return(
        <>
            <BlockWrapper>
                <div>
                    
                </div>
            </BlockWrapper>
        </>
    )
}

export default ListContentNewsBlock