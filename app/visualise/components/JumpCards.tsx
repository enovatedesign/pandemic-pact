import { ChevronDownIcon } from '@heroicons/react/solid'

import Card from '../../components/ContentBuilder/Common/Card'
import { JumpCardItem } from './types'

interface Props {
    items: JumpCardItem[]
    /** Tailwind grid classes; defaults to the grants 5-up layout. */
    gridClassName?: string
}

/**
 * Desktop-only row of jump cards that anchor-link down to each visualisation.
 * Shared by the grants and clinical-trials visualise pages.
 */
const JumpCards = ({
    items,
    gridClassName = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5',
}: Props) => {
    if (items.length === 0) return null

    return (
        <section className="hidden lg:block container mx-auto my-6 lg:my-12">
            <div className={gridClassName}>
                {items.map((item, index) => (
                    <Card
                        key={index}
                        entry={{ title: item.title, summary: item.summary, url: item.url }}
                        tags={false}
                        image={item.image}
                        animatedIcon={
                            item.url ? <ChevronDownIcon className="w-6 h-6" /> : undefined
                        }
                    />
                ))}
            </div>
        </section>
    )
}

export default JumpCards
