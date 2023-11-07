import BlockWrapper from "../BlockWrapper"
import PublicationsCard from "./Publications/PublicationsCard"
import { useInView, animated } from '@react-spring/web'
import { defaultProseClasses } from '@/app/helpers/prose-classes'

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
                <animated.div ref={ref} style={springs}>

                    {heading && (
                        <div className={`${defaultProseClasses.join(" ")} text-center mb-12`}>
                            <h2 dangerouslySetInnerHTML={{ __html: heading }}></h2>
                        </div>
                    )}

                    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        
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