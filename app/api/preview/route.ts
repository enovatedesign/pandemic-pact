import { NextRequest } from 'next/server'
import { draftMode } from 'next/headers'
import GraphQL from '../../lib/GraphQl'

export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get('token')
    const uri = req.nextUrl.searchParams.get('uri')

    if (!uri) {
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

    if (token) {
        draftMode().enable()

        return new Response(null, {
            status: 307,
            headers: {
                Location: `/preview/${data.entry.uri}?token=${token}`,
            },
        })
    }

    return new Response(null, {
        status: 307,
        headers: {
            Location: `/${data.entry.uri}`,
        },
    })
}

function unauthorized() {
    return new Response('Unauthorized', { status: 401 })
}