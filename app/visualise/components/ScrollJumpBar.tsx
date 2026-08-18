'use client'

import AnimateHeight from 'react-animate-height'

import JumpMenu from '@/app/components/JumpMenu'
import { JumpCardItem } from './types'
import { useScrollJumpBarVisibility } from './useScrollJumpBarVisibility'

interface Props {
    items: JumpCardItem[]
}

/**
 * Sticky bar that appears on scroll (and on narrow viewports) with a dropdown to
 * jump to any visualisation on the page. Self-manages its visibility via the
 * shared {@link useScrollJumpBarVisibility} hook. Shared by the grants and
 * clinical-trials visualise pages.
 */
const ScrollJumpBar = ({ items }: Props) => {
    const visible = useScrollJumpBarVisibility()

    const hasLinkableItems = items.some(item => item.url)

    if (!hasLinkableItems) return null

    return (
        <AnimateHeight
            duration={300}
            height={visible ? 'auto' : 0}
            className="sticky w-full z-20 top-0 backdrop-blur-sm bg-primary-lighter/75"
        >
            <JumpMenu items={items} />
        </AnimateHeight>
    )
}

export default ScrollJumpBar
