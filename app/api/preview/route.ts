import {NextRequest} from 'next/server'
import {draftMode} from 'next/headers'

export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get("token");
    const uri = req.nextUrl.searchParams.get("uri");

    if (token === null) {
        return new Response('No Preview token', {status: 401})
    }

    if (uri === null) {
        return new Response('No URI provided', {status: 401})
    }

    draftMode().enable();

    return new Response(null, {
        status: 307,
        headers: {
            Location: `${uri}?token=${token}`,
        },
    })
}
