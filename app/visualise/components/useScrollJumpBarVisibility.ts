'use client'

import { useEffect, useState } from 'react'
import { throttle, debounce } from 'lodash'

/**
 * Visibility logic for the sticky "jump to a visualisation" scroll bar, shared by
 * the grants and clinical-trials visualise pages.
 *
 * - On narrow viewports (< 1024px) the bar is always available.
 * - On wider viewports it appears once the user has scrolled past the threshold.
 */
export function useScrollJumpBarVisibility(scrollThreshold = 1000): boolean {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            setVisible(window.innerWidth < 1024)
        }
        const debouncedHandleResize = debounce(handleResize, 200)
        window.addEventListener('resize', debouncedHandleResize)

        const handleScroll = () => {
            if (window.innerWidth > 1024) {
                setVisible(window.scrollY > scrollThreshold)
            }
        }
        const throttledHandleScroll = throttle(handleScroll, 200)
        window.addEventListener('scroll', throttledHandleScroll)

        // Set the initial visibility on mount: narrow viewports show the bar
        // immediately, wider ones depend on the current scroll position.
        handleResize()
        handleScroll()

        return () => {
            window.removeEventListener('scroll', throttledHandleScroll)
            window.removeEventListener('resize', debouncedHandleResize)
        }
    }, [scrollThreshold])

    return visible
}
