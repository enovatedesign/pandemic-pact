import BlockWrapper from "../BlockWrapper"
import PublicationsCard from "./Publications/PublicationsCard"
import { useInView, animated } from '@react-spring/web';

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

    return (
        <>
            <BlockWrapper>
                <animated.div className="flex flex-col space-y-8 lg:space-y-12" ref={ref} style={springs}>

                    <h3 className="text-center text-2xl md:text-3xl lg:text-4xl text-black uppercase">
                        {heading}
                    </h3>

                    <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
                        
                        {customEntries.map((entry, index) => {
                            return (
                                <PublicationsCard entry={entry} key={index}/>
                            )
                        })}

                    </ul>
                </animated.div>
            </BlockWrapper>
        </>
    )
}

export default ListPublicationsBlock