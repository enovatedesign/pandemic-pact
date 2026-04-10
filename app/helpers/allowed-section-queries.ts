import { NextResponse } from 'next/server'

// Add the section handle of the allowed section to query from craft
export const allowedSectionQueries = [
    'news',
    'pages',
    'announcement',
    'publications'
]

/**
 * Validate a value against a regex and return a 400 response if invalid.
 * Returns null when valid, or a NextResponse when invalid.
 */
function validate(value: string | undefined, pattern: RegExp, label: string): NextResponse | null {
    if (!value || !pattern.test(value)) {
        return NextResponse.json({ error: `Invalid ${label}` }, { status: 400 })
    }
    return null
}

const HANDLE_PATTERN = /^[a-zA-Z][a-zA-Z0-9]*$/
const URI_PATTERN = /^[a-zA-Z0-9\-_/]+$/

export function validateSectionHandle(sectionHandle: string | undefined): NextResponse | null {
    if (!sectionHandle || !allowedSectionQueries.includes(sectionHandle)) {
        return NextResponse.json({ error: 'Invalid section handle' }, { status: 400 })
    }
    return null
}

export function validateTypeHandle(typeHandle: string | undefined): NextResponse | null {
    return validate(typeHandle, HANDLE_PATTERN, 'type handle')
}

export function validateUri(uri: string | undefined): NextResponse | null {
    return validate(uri, URI_PATTERN, 'URI')
}