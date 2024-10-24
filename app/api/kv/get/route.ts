const apiUrl = process.env.KV_REST_API_URL
const token = process.env.KV_REST_API_TOKEN

import { kv } from "@vercel/kv"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    const requestBody = await request.json()
    
    const { id } = requestBody

    if (!id) {
      console.error('No id provided')
      return
    }

    // Get the data from the KV store
    const data = await kv.get(id)

    // Reset the data in the KV store to update the TTL value
    await kv.set(
      id, 
      data,
      {
          ex: 15638404
      }
    )

    return NextResponse.json(data)
}
