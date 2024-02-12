'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { highlightMatchesInGrant } from '../../helpers/search'
import BasePageTitle from '../../components/PageTitle'

interface Props {
    grant: any
}

export default function PageTitle({ grant }: Props) {
    return (
        <Suspense fallback={<ServerComponent title={grant.GrantTitleEng} />}>
            <ClientComponent grant={grant} />
        </Suspense>
    )
}

function ClientComponent({ grant }: Props) {
    const searchParams = useSearchParams()

    const [title, setTitle] = useState<string>(grant.GrantTitleEng)

    useEffect(() => {
        highlightMatchesInGrant(grant, searchParams.get('q') || '').then(
            ({ GrantTitleEng }) => {
                setTitle(GrantTitleEng)
            }
        )
    }, [searchParams, grant, setTitle])

    return <ServerComponent title={title} />
}

function ServerComponent({ title }: { title: string }) {
    return <BasePageTitle>{title}</BasePageTitle>
}
