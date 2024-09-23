import { API_URL, API_TOKEN } from "../../lib/GraphQl";
import { NextRequest, NextResponse } from 'next/server'
import { allowedSectionQueries } from "@/app/helpers/allowed-section-queries";

export async function POST(request: NextRequest) {

    const requestBody = await request.json();
    
    const { sectionHandle, entryTypeHandle, limit, pageNumber, relation } = requestBody;
    const queryLimit = limit && limit < 12 ? limit : 12
    const queryOffset = pageNumber ? queryLimit * (pageNumber - 1) : 0
    
    // To Do: Handle error accordingly
    if (!allowedSectionQueries.includes(sectionHandle)) {
        throw new Error(`Unauthorized access to section: ${sectionHandle}`)
    }

    let relationQuery = relation ? relation : null

    const query = `
        query {    
            entries(
                status: "enabled", 
                section: "${sectionHandle}", 
                orderBy: "dateCreated",
                limit: ${queryLimit}, 
                offset: ${queryOffset}
                ${relationQuery ? `, relatedToEntries: [{uri: "${relationQuery}"}]` : ''}
            ) {    
                ... on ${sectionHandle}_${entryTypeHandle}_Entry {
                    title
                    summary
                    url
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
