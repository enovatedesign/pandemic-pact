export const API_URL = process.env.CONTENT_API_URL;
export const API_TOKEN = process.env.CONTENT_API_TOKEN;

export default async function craft(query: string, variables: Record<string, unknown> = {}, previewToken?: string, options: { revalidate?: number } = {}) {

    const request: RequestInit = {
        method: "POST",
        next: { tags: ['cms'] },
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

    if (previewToken) {
        // Previews must always render the latest unpublished content.
        request.cache = 'no-store';
    } else if (typeof options.revalidate === 'number') {
        // Caller explicitly opts into cached (ISR) data. Used by the
        // statically-generated sitemap so the build's `CI` no-store default
        // below doesn't opt the route out of static generation — which is what
        // previously made /sitemap.xml a dynamic route that 500'd at runtime.
        request.next = { tags: ['cms'], revalidate: options.revalidate };
    } else if (
        process.env.NODE_ENV !== 'production' ||
        process.env.CI
    ) {
        request.cache = 'no-store';
    }

    const response = await fetch(API_URL as string, request);

    if (!response.ok) {
        const text = await response.text();
        console.error('CMS API Error:', {
            status: response.status,
            statusText: response.statusText,
            url: API_URL,
            responsePreview: text.substring(0, 500)
        });
        throw new Error(`Network error: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    let json;
    
    try {
        json = JSON.parse(text);
    } catch (error) {
        console.error('Failed to parse CMS response as JSON:', {
            url: API_URL,
            responsePreview: text.substring(0, 500),
            error: error instanceof Error ? error.message : String(error)
        });
        throw new Error(`Invalid JSON response from CMS. Response starts with: ${text.substring(0, 100)}`);
    }

    if (json.errors) {
        console.error('GraphQL errors from CMS:', json.errors);
        throw new Error(`GraphQL error: ${JSON.stringify(json.errors)}`);
    }

    return json.data;
}
