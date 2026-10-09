'use client'

import { usePathname } from 'next/navigation'

/**
 * usePathname(), but with `/index` reported as `/`. On Vercel the two URLs share one
 * cached render of the homepage, so whichever is requested first decides the path the
 * server saw; normalising it keeps that HTML hydrating cleanly from either URL.
 */
export default function usePagePathname() {
    const pathname = usePathname() ?? '/'

    return pathname === '/index' ? '/' : pathname
}
