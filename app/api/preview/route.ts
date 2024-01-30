import {NextRequest} from 'next/server'
import { draftMode } from 'next/headers'

export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get("x-craft-live-preview");
    const uri = req.nextUrl.searchParams.get("uri");

    console.log(token, uri);

    if (token === null) {
        return new Response('No Preview token', { status: 401 })
    }

    if (uri === null) {
        return new Response('No URI provided', { status: 401 })
    }

    draftMode().enable();

    if (!draftMode().isEnabled) {
        return new Response(`Draft mode is set to false.`, { status: 401 })
    }

    return new Response(null, {
        status: 307,
        headers: {
            Location: uri,
        },
    })
}
