import { API_URL, API_TOKEN } from "../../lib/GraphQl";
import { NextRequest, NextResponse } from 'next/server'
import { allowedSectionQueries } from "@/app/helpers/allowed-section-queries";

export async function POST(request: NextRequest) {
    const requestBody = await request.json();

    const { sectionHandle, uri, typeHandle } = requestBody;

    if (!allowedSectionQueries.includes(sectionHandle)) {
        throw new Error(`Unauthorized access to section: ${sectionHandle}`)
    }

    const query = `
        query {
            entries(
                status: "enabled",
                section: "${sectionHandle}",
                uri: "${uri}",
            ) {
                ... on ${typeHandle}_Entry {
                    children {
                        id
                    }
                }
            }
        }
    `
    const fetchRequest: RequestInit = {
        method: "POST",
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

    const count = json.data.entries?.[0]?.children?.length ?? 0;

    return NextResponse.json(count);
};
