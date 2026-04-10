import { API_URL, API_TOKEN } from "../../lib/GraphQl";
import { NextRequest, NextResponse } from 'next/server'
import { validateSectionHandle, validateTypeHandle, validateUri } from "@/app/helpers/allowed-section-queries";

export async function POST(request: NextRequest) {
    const requestBody = await request.json();

    const { sectionHandle, uri, typeHandle, limit, pageNumber } = requestBody;

    const queryLimit = limit < 12 ? limit : 12
    const queryOffset = pageNumber ? queryLimit * (pageNumber - 1) : 0

    const sectionError = validateSectionHandle(sectionHandle)
    if (sectionError) return sectionError

    const typeError = validateTypeHandle(typeHandle)
    if (typeError) return typeError

    const uriError = validateUri(uri)
    if (uriError) return uriError

    const query = `
        query {
            entries(
                status: "enabled",
                section: "${sectionHandle}",
                uri: "${uri}",
            ) {
                ... on ${typeHandle}_Entry {
                    children(
                        orderBy: "dateCreated",
                        limit: ${queryLimit},
                        offset: ${queryOffset}
                    ) {
                        ... on ${typeHandle}_Entry {
                            title
                            summary
                            uri
                            thumbnailImage @transform(transform: "c480x300") {
                                url
                                alt
                                width
                                height
                            }
                        }
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

    const children = json.data.entries?.[0]?.children ?? [];

    return NextResponse.json(children);
};
