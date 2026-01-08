'use server'

/**
 * Checks if a URL allows being embedded in an iframe by inspecting
 * X-Frame-Options and Content-Security-Policy headers.
 */
export async function checkFrameHeaders(url: string): Promise<{ canEmbed: boolean }> {
    if (!url) return { canEmbed: false }

    try {
        const response = await fetch(url, {
            method: 'HEAD',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            redirect: 'follow',
            next: { revalidate: 3600 }
        })

        // If the request fails (404, 500, 403), we can't be sure it's safe to embed, so fallback.
        if (!response.ok) {
            return { canEmbed: false }
        }

        // 1. Check X-Frame-Options
        const xFrameOptions = response.headers.get('x-frame-options');
        if (xFrameOptions) {
            const value = xFrameOptions.toUpperCase();
            if (value.includes('DENY') || value.includes('SAMEORIGIN')) {
                return { canEmbed: false }
            }
        }

        // 2. Check Content-Security-Policy
        // We check both standard and Report-Only (just in case, though Report-Only doesn't strictly block, some browsers might be strict or it implies intent)
        const csp = response.headers.get('content-security-policy') || response.headers.get('content-security-policy-report-only');

        if (csp) {
            const cspLower = csp.toLowerCase();
            if (cspLower.includes('frame-ancestors')) {
                // If frame-ancestors is present, it acts as an allowlist. 
                // If it DOESN'T contain *, and we are not in it (we can't check efficiently), assume blocked.
                // Exceptions: if it explicitly allows https: or * 

                // Regex to find the frame-ancestors directive value
                // frame-ancestors source-list;
                const match = cspLower.match(/frame-ancestors\s+([^;]+)/);
                if (match) {
                    const sourceList = match[1];

                    // If specific blocking keywords are found
                    if (sourceList.includes("'none'") || sourceList.includes("'self'")) {
                        return { canEmbed: false }
                    }

                    // If it is NOT a wildcard (start with * or http: or https:), assume blocked
                    // Logic: if specific domains are listed, we aren't one of them.
                    // We look for loose permission
                    const isLoose = sourceList.includes('*') || sourceList.includes('https:');
                    if (!isLoose) {
                        return { canEmbed: false }
                    }
                } else {
                    // Fallback if regex fails but keyword exists
                    return { canEmbed: false };
                }
            }
        }

        // 3. Known Blockers via URL (Server-side cleanup)
        // Some sites block HEAD requests or use JS frame busting that we can't detect via headers.
        const knownBlockers = ['recruitee.com', 'workday', 'fountain.com'];
        if (knownBlockers.some(b => url.includes(b))) {
            return { canEmbed: false }
        }

        return { canEmbed: true }
    } catch (error) {
        console.error('Error checking frame headers for:', url, error)
        return { canEmbed: false }
    }
}
