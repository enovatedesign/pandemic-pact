export const API_URL = process.env.CONTENT_API_URL;
export const API_TOKEN = process.env.CONTENT_API_TOKEN;

export default async function craft(query: string, variables: Record<string, unknown> = {}, previewToken?: string) {

    const request: RequestInit = {
        method: "POST",
        // cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_TOKEN}`
        },
        body: JSON.stringify({
            query,
            variables
        })
    };

    if (previewToken) {
        (request.headers as any)['X-Craft-Token'] = previewToken;
    }

    const response = await fetch(API_URL as string, request);

    if (!response.ok) {
        throw new Error(`Network error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();

    if (json.errors) {
        throw new Error(`GraphQL error: ${JSON.stringify(json.errors)}`);
    }

    return json.data;
}