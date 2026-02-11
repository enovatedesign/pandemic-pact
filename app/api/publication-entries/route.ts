import { API_URL, API_TOKEN } from "../../lib/GraphQl";
import { NextRequest, NextResponse } from 'next/server'
import { allowedSectionQueries } from "@/app/helpers/allowed-section-queries";

export async function POST(request: NextRequest) {

    const requestBody = await request.json();

    const { limit, pageNumber } = requestBody;
    const sectionHandle = 'publications'
    const queryLimit = limit && limit < 12 ? limit : 12
    const queryOffset = pageNumber ? queryLimit * (pageNumber - 1) : 0

    // To Do: Handle error accordingly
    if (!allowedSectionQueries.includes(sectionHandle)) {
        throw new Error(`Unauthorized access to section: ${sectionHandle}`)
    }

    const query = `
        query {
            entries(
                status: "enabled",
                section: "${sectionHandle}",
                orderBy: "postDate DESC",
                limit: ${queryLimit},
                offset: ${queryOffset}
            ) {
                ... on externalPublication_Entry {
                    id
                    title
                    summary
                    externalLink
                    postDate
                    thumbnailImage @transform(transform: "c480x300") {
                        ... on contentAssets_Asset {
                            altText
                            height
                            url
                            width
                        }
                    }
                    publicationType(label: true)
                    typeHandle
                }
                ... on internalPublication_Entry {
                    id
                    title
                    summary
                    postDate
                    thumbnailImage @transform(transform: "c480x300") {
                        ... on contentAssets_Asset {
                            altText
                            height
                            url
                            width
                        }
                    }
                    typeHandle
                    uri
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

    return NextResponse.json(json.data.entries);
};
