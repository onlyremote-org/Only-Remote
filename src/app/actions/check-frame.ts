'use server'

/**
 * Checks if a URL allows being embedded in an iframe by inspecting
 * X-Frame-Options and Content-Security-Policy headers.
 */
export async function checkFrameHeaders(url: string): Promise<{ canEmbed: boolean }> {
    if (!url) return { canEmbed: false }

    try {
        // strict-origin-when-cross-origin is a common referrer policy that might block if not set, 
        // but here we act as a server.
        const response = await fetch(url, {
            method: 'HEAD',
            // User-Agent: mimick a browser to avoid bot blocking
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            redirect: 'follow', // Follow redirects to check the final destination's headers
            next: { revalidate: 3600 } // Cache checks for an hour to reduce traffic
        })

        // 1. Check X-Frame-Options
        // Possible values: DENY, SAMEORIGIN
        const xFrameOptions = response.headers.get('x-frame-options')?.toUpperCase()
        if (xFrameOptions === 'DENY' || xFrameOptions === 'SAMEORIGIN') {
            return { canEmbed: false }
        }

        // 2. Check Content-Security-Policy
        // Look for frame-ancestors directive
        const csp = response.headers.get('content-security-policy')?.toLowerCase()
        if (csp) {
            if (csp.includes('frame-ancestors')) {
                // If it specifies ancestors, it's usually restrictive for us unless we are whitelisted (unlikely)
                // Common cases: 'none', 'self'
                if (csp.includes("frame-ancestors 'none'") || csp.includes("frame-ancestors 'self'")) {
                    return { canEmbed: false }
                }
                // If it has a list of domains and we aren't in it (we can't easily parse this perfectly regex-free, 
                // but generally if frame-ancestors exists, it's a whitelist. 
                // Safer to assume blocked if we see frame-ancestors unless it's just *
                if (!csp.includes("frame-ancestors *")) {
                    return { canEmbed: false }
                }
            }
        }

        return { canEmbed: true }
    } catch (error) {
        console.error('Error checking frame headers for:', url, error)
        // If we can't reach it (e.g. 404 or connection refused), we probably can't embed it anyway
        // OR it might be a CORS issue if we were client side, but server side it means network error.
        // Safest fallback is to show "Open Externally" if the check fails completely.
        return { canEmbed: false }
    }
}
