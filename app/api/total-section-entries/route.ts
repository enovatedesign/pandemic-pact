import { API_URL, API_TOKEN } from "../../lib/GraphQl";
import { NextRequest, NextResponse } from 'next/server'
import { validateSectionHandle } from "../../helpers/allowed-section-queries";

export async function POST(request: NextRequest) {

    const requestBody = await request.json();

    const { sectionHandle } = requestBody;

    const sectionError = validateSectionHandle(sectionHandle)
    if (sectionError) return sectionError

    const query = `
        query {    
            entryCount(status: "enabled", section: "${sectionHandle}")
        }
    `
    const fetchRequest: RequestInit = {
        method: "POST",
        // cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_TOKEN}`
        },
        body: JSON.stringify({
            query,
        })
    };

    const response = await fetch(API_URL as string, fetchRequest);
    
    if (!response.ok) {
        throw new Error(`Network error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();

    if (json.errors) {
        throw new Error(`GraphQL error: ${JSON.stringify(json.errors)}`);
    }
    
    return NextResponse.json(json.data);
};
