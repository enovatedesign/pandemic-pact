import BlockWrapper from "../BlockWrapper"
import Image from "next/image";

const NewsCard = ({entry}) => {
    const { title, summary } = entry

    console.log(summary)
    const classes = [
        'flex flex-col overflow-hidden w-full h-full',
        'transition duration-200',
        'rounded bg-white shadow-lg',
        'hover:shadow-xl hover:scale-105'
    ].join(' ')

    return (
        <div key={entry.index} >
            <a href={entry.url} className={classes}>
                {/* <Image 
                    src={thumbnailImage[0].url}
                /> */}
                <h3 className='text-xl text-primary'>
                    {title}
                </h3>
                <p>
                    {summary}
                </p>
            </a>
        </div>
    )
};

const ListContentNewsBlock = ({block}) => {
    
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