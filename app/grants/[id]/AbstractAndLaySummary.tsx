'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import AnimateHeight from 'react-animate-height'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { debounce } from 'lodash'
import RichText from '@/app/components/ContentBuilder/Common/RichText'
import { highlightMatchesInGrant } from '../../helpers/search'

interface Props {
    grant: any
}

export default function AbstractAndLaySummary({ grant }: Props) {
    return (
        <Suspense
            fallback={
                <ServerComponent
                    abstract={grant.Abstract}
                    laySummary={grant.LaySummary}
                />
            }
        >
            <ClientComponent grant={grant} />
        </Suspense>
    )
}

function ClientComponent({ grant }: Props) {
    const searchParams = useSearchParams()

    const [abstract, setAbstract] = useState<string>(grant.Abstract)

    const [laySummary, setLaySummary] = useState<string | null>(
        grant.LaySummary
    )

    useEffect(() => {
        highlightMatchesInGrant(grant, searchParams.get('q') || '').then(
            ({ Abstract, LaySummary }) => {
                setAbstract(Abstract)
                setLaySummary(LaySummary)
            }
        )
    }, [searchParams, grant, setAbstract, setLaySummary])

    return <ServerComponent abstract={abstract} laySummary={laySummary} />
}

function ServerComponent({
    abstract,
    laySummary,
}: {
    abstract: string
    laySummary: string | null
}) {
    const [abstractShow, setAbstractShow] = useState(false)
    const [readMore, setReadMore] = useState(false)
    const [backgroundShow, setBackgroundShow] = useState(true)
    const [animateHeight, setAnimateHeight] = useState<'auto' | number>('auto')

    useEffect(() => {
        const abstract = document.getElementById('abstract')
        const hasReadMore = (abstract?.offsetHeight || 0) > 230

        const checkHeight = () => {
            setReadMore(hasReadMore)
            setAnimateHeight(hasReadMore ? 230 : 'auto')
        }

        const debouncedCheckHeight = debounce(checkHeight, 200)

        if (document.readyState === 'complete') {
            checkHeight()
        } else {
            window.addEventListener('load', checkHeight)
        }

        window.addEventListener('resize', debouncedCheckHeight)

        return () => {
            window.removeEventListener('load', checkHeight)
            window.removeEventListener('resize', debouncedCheckHeight)
        }
    }, [readMore])

    useEffect(() => {
        const handleBackground = () => {
            if (readMore) {
                setBackgroundShow(true)
            } else {
                setBackgroundShow(false)
            }
        }

        const debouncedBackground = debounce(handleBackground, 200)

        if (document.readyState === 'complete') {
            handleBackground()
        } else {
            window.addEventListener('load', handleBackground)
        }

        window.addEventListener('resize', debouncedBackground)

        return () => {
            window.removeEventListener('load', handleBackground)
            window.removeEventListener('resize', debouncedBackground)
        }
    }, [backgroundShow, readMore])

    return (
        <>
            <div className="grant-abstract flex flex-col space-y-4">
                <h3 className="text-secondary uppercase tracking-widest text-lg lg:text-xl font-medium">
                    Abstract
                </h3>

                <AnimateHeight
                    duration={300}
                    height={abstractShow ? 'auto' : animateHeight}
                    className="relative"
                >
                    <div id="abstract">
                        <RichText text={abstract} customClasses="max-w-none" />
                        {backgroundShow && !abstractShow && (
                            <div className="absolute inset-0 top-0 left-0 bg-gradient-to-b from-transparent to-white transition duration-300" />
                        )}
                    </div>
                </AnimateHeight>

                {readMore && (
                    <button
                        onClick={() => setAbstractShow(!abstractShow)}
                        className="w-auto uppercase font-bold tracking-wider flex items-center"
                    >
                        <span className="inline-flex text-secondary">
                            {abstractShow ? 'read less' : 'read more'}
                        </span>
                        <ChevronDownIcon
                            className={`${
                                abstractShow && '-rotate-180'
                            } transition duration-300 w-8 h-8 text-secondary`}
                        />
                    </button>
                )}
            </div>

            {laySummary && (
                <div className="grant-lay-summary">
                    <h3>Lay Summary</h3>

                    <div
                        className="mt-2"
                        dangerouslySetInnerHTML={{
                            __html: laySummary,
                        }}
                    />
                </div>
            )}
        </>
    )
}
