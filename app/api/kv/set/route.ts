import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {

    const requestBody = await request.json()

    const { id, filters } = requestBody

    // Set the data to the kv store, only if id and filters are present
    if (id && filters) {
        await kv.set(
            id, 
            JSON.stringify(filters),
            {
                ex: 15638404
            }
        )
    }

    return NextResponse.json({ message: 'Data saved successfully.' })
}