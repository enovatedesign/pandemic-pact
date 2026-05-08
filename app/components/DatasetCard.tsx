import Link from 'next/link'
import Image from 'next/image'
import { Dataset, getHrefForDataset } from '../helpers/datasets'

export type Mode = 'visualise' | 'explore'
export type Variant = 'modal' | 'inline'

interface Props {
    dataset: Dataset
    mode: Mode
    onSelect: () => void
    compact?: boolean
    variant?: Variant
}

export default function DatasetCard({ dataset, mode, onSelect, compact = false, variant = 'modal' }: Props) {
    const isInline = variant === 'inline'

    const sharedClasses = [
        'relative flex flex-col h-full rounded-xl border lg:border-2 text-left transition-colors duration-150',
        compact ? 'p-4' : 'p-6',
    ].join(' ')

    const iconBoxClasses = [
        'relative shrink-0 overflow-hidden rounded-lg',
        compact ? 'size-14 lg:size-24' : 'size-20 lg:size-28',
    ].join(' ')

    const titleClasses = isInline
        ? 'text-white lg:text-secondary text-lg leading-tight'
        : 'text-secondary text-lg leading-tight'

    const descriptionClasses = isInline
        ? 'text-white/70 lg:text-secondary/70 text-sm'
        : 'text-secondary/70 text-sm'

    const content = (
        <>
            <div className="flex items-start gap-4">
                <span className={iconBoxClasses}>
                    <Image
                        src={dataset.iconSrc}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 112px, 80px"
                        className="object-cover"
                    />
                </span>

                <div className="flex flex-col gap-1.5 min-w-0">
                    <h3 className={titleClasses}>
                        {dataset.label}
                    </h3>
                    <p className={descriptionClasses}>
                        {dataset.description}
                    </p>
                </div>
            </div>

            {dataset.comingSoon && (
                <span className="absolute right-4 top-0 -translate-y-1/2 inline-flex items-center overflow-hidden px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider text-white">
                    <span aria-hidden="true" className="absolute inset-0 bg-brand-red animate-pulse" />
                    <span className="relative z-10">Coming soon</span>
                </span>
            )}
        </>
    )

    if (dataset.comingSoon) {
        const disabledBgClasses = isInline ? 'bg-gray-100/20 lg:bg-gray-100' : 'bg-gray-100'

        return (
            <div
                aria-disabled="true"
                className={`${sharedClasses} border-gray-200 ${disabledBgClasses} opacity-70 cursor-not-allowed`}
            >
                {content}
            </div>
        )
    }

    return (
        <Link
            href={getHrefForDataset(dataset, mode)}
            onClick={onSelect}
            className={`group ${sharedClasses} border-primary/25 bg-primary/10 hover:border-primary hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
        >
            {content}
        </Link>
    )
}
