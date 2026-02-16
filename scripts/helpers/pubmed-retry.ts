import { warn } from './log'

export interface RetryOptions {
    maxRetries: number
    baseDelayMs: number
    maxDelayMs: number
}

const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504]

export async function fetchWithRetry(
    url: string,
    options: RetryOptions,
): Promise<Response> {
    const { maxRetries, baseDelayMs, maxDelayMs } = options

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url)

            if (response.ok || !RETRYABLE_STATUS_CODES.includes(response.status)) {
                return response
            }

            if (attempt < maxRetries) {
                const delay = Math.min(
                    baseDelayMs * Math.pow(2, attempt) + Math.random() * baseDelayMs,
                    maxDelayMs,
                )
                warn(`PubMed API returned ${response.status}, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})`)
                await sleep(delay)
            } else {
                return response
            }
        } catch (error) {
            if (attempt < maxRetries) {
                const delay = Math.min(
                    baseDelayMs * Math.pow(2, attempt) + Math.random() * baseDelayMs,
                    maxDelayMs,
                )
                const msg = error instanceof Error ? error.message : String(error)
                warn(`PubMed API request failed: ${msg}, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})`)
                await sleep(delay)
            } else {
                throw error
            }
        }
    }

    // Should not reach here, but TypeScript needs it
    throw new Error('Unexpected end of retry loop')
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}
