import { Job, FetchJobsParams } from './types'

// Source: https://github.com/jobright-ai/Daily-H1B-Jobs-In-Tech
const README_URL = 'https://raw.githubusercontent.com/jobright-ai/Daily-H1B-Jobs-In-Tech/master/README.md'

export async function fetchH1BJobs(params: FetchJobsParams): Promise<Job[]> {
    try {
        // Cache for 48 hours (172800 seconds) as requested
        const response = await fetch(README_URL, {
            next: { revalidate: 172800 }
        })

        if (!response.ok) {
            console.error(`H1B API error: ${response.statusText}`)
            return []
        }

        const text = await response.text()
        const jobs: Job[] = []

        const lines = text.split('\n')
        let currentCategory = 'Unknown'

        for (const line of lines) {
            // Detect category headers
            if (line.includes('### Software Engineer')) currentCategory = 'Software Engineer'
            else if (line.includes('### Product Manager')) currentCategory = 'Product Manager'
            else if (line.includes('### Marketing')) currentCategory = 'Marketing'
            else if (line.includes('### Arts & Design')) currentCategory = 'Design'

            // Parse table rows
            if (line.trim().startsWith('|') && !line.includes('---') && !line.includes('Company')) {
                // Split by | and trim whitespace
                let parts = line.split('|').map(p => p.trim())

                // Remove empty start/end elements common in markdown tables (e.g. | col1 | col2 |)
                if (parts.length > 0 && parts[0] === '') parts.shift()
                if (parts.length > 0 && parts[parts.length - 1] === '') parts.pop()

                // Expected format: [Company, Title, Level, Location, H1B Status, Link, Date]
                // We need at least 6 columns to be useful
                if (parts.length >= 6) {
                    // Helper to extract link text and url
                    const extractLink = (str: string) => {
                        const match = str.match(/\[(.*?)\]\((.*?)\)/)
                        return match ? { text: match[1], url: match[2] } : { text: str, url: '' }
                    }

                    // Clean up company name (remove bold markers if present)
                    const cleanCompany = (str: string) => {
                        return str.replace(/\*\*/g, '')
                    }

                    const companyData = extractLink(cleanCompany(parts[0]))
                    const titleData = extractLink(parts[1])
                    // parts[2] is Level
                    const location = parts[3]
                    // parts[4] is H1B status icon
                    const applyData = extractLink(parts[5])
                    const date = parts[6]

                    const company = companyData.text
                    const title = titleData.text
                    const applyUrl = applyData.url || titleData.url || ''

                    // Generate a unique ID based on title and company
                    const id = `h1b-${company.replace(/\s+/g, '-').toLowerCase()}-${title.replace(/\s+/g, '-').toLowerCase()}`.replace(/[^a-z0-9-]/g, '')

                    // Parse date (e.g. "2023-10-27" or "Oct 27, 2023")
                    let publishedAt = new Date().toISOString()
                    if (date) {
                        const parsedDate = new Date(date)
                        if (!isNaN(parsedDate.getTime())) {
                            publishedAt = parsedDate.toISOString()
                        }
                    }

                    if (title && company && applyUrl) {
                        jobs.push({
                            id,
                            title,
                            company,
                            location,
                            category: currentCategory,
                            job_type: 'Full-time', // Assumed for H1B
                            salary: null,
                            tags: ['H1B', currentCategory],
                            description_snippet: `H-1B sponsored role at ${company}.`,
                            source: 'other',
                            source_url: applyUrl,
                            apply_url: applyUrl,
                            published_at: publishedAt,
                            company_logo: null
                        })
                    }
                }
            }
        }

        console.log(`[H1B] Fetched ${jobs.length} jobs from GitHub`)
        return jobs

    } catch (error) {
        console.error('Error fetching H1B jobs:', error)
        return []
    }
}
