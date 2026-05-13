const NAMED: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
}

export function decodeHtmlEntities(input: string): string {
    if (!input) return input
    return input.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, body: string) => {
        if (body[0] === '#') {
            const codePoint = body[1] === 'x' || body[1] === 'X'
                ? parseInt(body.slice(2), 16)
                : parseInt(body.slice(1), 10)
            return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match
        }
        const named = NAMED[body.toLowerCase()]
        return named ?? match
    })
}
