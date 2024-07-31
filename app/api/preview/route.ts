import { NextRequest } from 'next/server'
import { draftMode } from 'next/headers'
import GraphQL from '../../lib/GraphQl'

export async function GET(req: NextRequest) {
    const craftLivePreview = req.nextUrl.searchParams.get(
        'x-craft-live-preview'
    )
    const token = req.nextUrl.searchParams.get('token')
    const uri = req.nextUrl.searchParams.get('uri')

    if (!craftLivePreview || !uri) {
        return unauthorized()
    }

    const data = await GraphQL(
        `
            query ($uri: [String]) {
              entry: entry(status: "enabled", uri: $uri) {
                uri
              }
            }
        `,
        { uri },
        token ?? undefined
    )

    if (!data.entry) {
        return unauthorized()
    }

    draftMode().enable()

    return new Response(null, {
        status: 307,
        headers: {
            Location: `/preview/${data.entry.uri}?token=${token}`,
        },
    })
}

function unauthorized() {
    return new Response('Unauthorized', { status: 401 })
}