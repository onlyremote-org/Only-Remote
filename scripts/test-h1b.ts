import { fetchH1BJobs } from '../src/lib/jobs/h1b'

async function main() {
    console.log('Testing H-1B Fetcher...')

    // Fetch raw text first to debug
    try {
        const response = await fetch('https://raw.githubusercontent.com/jobright-ai/Daily-H1B-Jobs-In-Tech/master/README.md')
        const text = await response.text()
        const fs = require('fs')
        fs.writeFileSync('debug_h1b.txt', text)
        console.log('Wrote raw text to debug_h1b.txt')
    } catch (e) {
        console.error('Failed to fetch raw text:', e)
    }

    const jobs = await fetchH1BJobs({})
    console.log(`Fetched ${jobs.length} jobs`)

    if (jobs.length > 0) {
        console.log('First job sample:', JSON.stringify(jobs[0], null, 2))
    } else {
        console.log('No jobs fetched. Check logs for errors.')
    }
}

main()
