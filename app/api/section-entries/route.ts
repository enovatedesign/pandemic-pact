import { API_URL, API_TOKEN } from "../../lib/GraphQl";
import { NextRequest, NextResponse } from 'next/server'
import { validateSectionHandle, validateTypeHandle, validateUri } from "@/app/helpers/allowed-section-queries";

export async function POST(request: NextRequest) {

    const requestBody = await request.json();

    const { sectionHandle, entryTypeHandle, limit, pageNumber, relation } = requestBody;
    const queryLimit = limit && limit < 12 ? limit : 12
    const queryOffset = pageNumber ? queryLimit * (pageNumber - 1) : 0

    const sectionError = validateSectionHandle(sectionHandle)
    if (sectionError) return sectionError

    const typeError = validateTypeHandle(entryTypeHandle)
    if (typeError) return typeError

    if (relation) {
        const relationError = validateUri(relation)
        if (relationError) return relationError
    }

    let relationQuery = relation ? relation : null

    const query = `
        query {
            entries(
                status: "enabled",
                section: "${sectionHandle}",
                orderBy: "dateCreated DESC",
                limit: ${queryLimit},
                offset: ${queryOffset}
                ${relationQuery ? `, relatedToEntries: [{uri: "${relationQuery}"}]` : ''}
            ) {
                ... on ${entryTypeHandle}_Entry {
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
    
    return NextResponse.json(json.data.entries);
};
