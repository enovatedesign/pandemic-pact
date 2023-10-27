import BlockWrapper from "../BlockWrapper";
import NewsCard from "../News/NewsCard";
import { useInView, animated } from '@react-spring/web';

type Props = {
    block: {
        customEntries: {
            url: string,
            title: string,
            summary: string
            thumbnailImage: {
              url: string,
              width: number,
              height: number,
              alt: string,
            }
        }
        limit: number,
        paginate: boolean,
        addTagsMenu: boolean,
    }
}

const ListContentNewsBlock = ( {block}: Props ) => {
    
    const limit = block.limit ?? null
    const customEntries = block.customEntries.slice(0, limit) ?? null
    const tags = block.addTagsMenu ?? false
    const paginate = block.paginate ?? false

    const [ref, springs] = useInView(
        () => ({
            from: {
                opacity: 0,
                y: 100,
            },
            to: {
                opacity: 1,
                y: 0,
            },
        }),
        {
            once: true,
        }
    );

    return(
        <BlockWrapper>
            <animated.div ref={ref} style={springs}>
                <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {customEntries.map((entry, index) => {
                        return <NewsCard entry={entry} key={index} tags={tags}/>
                    })}
                </ul>
            </animated.div>
        </BlockWrapper>
    )
}

export default ListContentNewsBlock