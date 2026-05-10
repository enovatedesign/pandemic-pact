'use client'

import { useEffect } from 'react'

const LOCK_CLASS = 'overflow-y-hidden'

export default function useScrollLock(active: boolean) {
    useEffect(() => {
        if (!active) return
        const body = document.body
        if (body.classList.contains(LOCK_CLASS)) return
        body.classList.add(LOCK_CLASS)
        return () => body.classList.remove(LOCK_CLASS)
    }, [active])
}
