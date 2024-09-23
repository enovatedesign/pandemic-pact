"use client"

import { useEffect } from 'react'
import { useRouter, notFound } from 'next/navigation'

interface RedirectTemplateProps {
    data: {
        entry: {
            children: { url: string }[]
            redirectEntry: { url: string }[]
        }
    }
}

export default function RedirectTemplate({ data }: RedirectTemplateProps) {
    
    const children = data.entry.children
    const redirectEntry = data.entry.redirectEntry
    
    const router = useRouter()

    const redirectEntryUrl = redirectEntry.length > 0 ? redirectEntry[0].url : null

    const childUrl = children.length > 0 ? children[0].url : null
    
    const activeRedirectUrl = redirectEntryUrl ?? childUrl

    useEffect(() => {
        if (activeRedirectUrl) {
            router.replace(activeRedirectUrl);
        } else {
            notFound()
        }
    }, [activeRedirectUrl, router])

    return null;
}
