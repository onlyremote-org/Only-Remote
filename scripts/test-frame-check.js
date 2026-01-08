// Helper to run the check in a standalone script context (mocking fetch if needed, 
// but here we rely on Node's fetch if available or need a polyfill, but let's try assuming Node 18+)

// Since checkFrameHeaders is 'use server', we might need to copy the logic or require it carefully.
// To avoid transpilation issues with 'use server', I will just copy the logic here for debugging purposes.

async function debugFrameHeaders(url) {
    console.log(`Checking URL: ${url}`);
    try {
        const response = await fetch(url, {
            method: 'HEAD',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            redirect: 'follow'
        });

        console.log(`Status: ${response.status} ${response.statusText}`);

        const headers = {};
        response.headers.forEach((value, key) => headers[key] = value);
        console.log('Headers:', headers);

        const xFrameOptions = response.headers.get('x-frame-options');
        const csp = response.headers.get('content-security-policy');

        console.log('X-Frame-Options:', xFrameOptions);
        console.log('Content-Security-Policy:', csp);

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// URL from the user screenshot (inferred)
const targetUrl = 'https://anywhereworks.recruitee.com/o/business-management-intern';

debugFrameHeaders(targetUrl);
