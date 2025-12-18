export function stripHtml(html: string): string {
    if (!html) return ''
    // Remove HTML tags
    let text = html.replace(/<[^>]*>?/gm, ' ')
    // Decode common entities (basic)
    text = text
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
    // Trim whitespace
    return text.replace(/\s+/g, ' ').trim()
}

export function makeSnippet(text: string, maxLength = 400): string {
    if (!text) return ''
    if (text.length <= maxLength) return text

    const truncated = text.slice(0, maxLength)
    // Try to cut at the last space
    const lastSpace = truncated.lastIndexOf(' ')
    if (lastSpace > 0) {
        return truncated.slice(0, lastSpace) + '...'
    }
    return truncated + '...'
}
