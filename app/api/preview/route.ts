import {NextRequest} from 'next/server'
import {draftMode} from 'next/headers'
import GraphQL from '../../lib/GraphQl'

export async function GET(req: NextRequest) {
    const craftLivePreview = req.nextUrl.searchParams.get("x-craft-live-preview")
    const token = req.nextUrl.searchParams.get("token")
    const slug = req.nextUrl.searchParams.get("uri")

    if (!craftLivePreview || !token || !slug) {
        return unauthorized()
    }

    const data = await GraphQL(
        `
            query ($slug: [String]) {
              entry: entry(status: "enabled", slug: $slug) {
                slug
              }
            }
        `,
        {slug},
        token
    );

    if (!data.entry) {
        return unauthorized()
    }

    draftMode().enable()

    return new Response(null, {
        status: 307,
        headers: {
            Location: `${data.entry.slug}?token=${token}`,
        },
    })
}

function unauthorized() {
    return new Response('Unauthorized', {status: 401})
}
