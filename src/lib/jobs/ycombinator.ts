import { Job, FetchJobsParams } from './types'

const API_KEY = process.env.YCOMBINATOR_API_KEY
const API_HOST = 'free-y-combinator-jobs-api.p.rapidapi.com'
const BASE_URL = `https://${API_HOST}/active-jb-7d`

interface YCJob {
    id: string
    title: string
    organization: string
    organization_logo?: string
    date_posted: string
    url: string
    description_text?: string
    description_html?: string
    location?: string
    job_location?: string
    locations_derived?: string[]
    employment_type?: string[]
    source?: string
}

export async function fetchYCJobs(params: FetchJobsParams): Promise<Job[]> {
    console.log(`[YCJobs] Fetching with params: ${JSON.stringify(params)}`)

    try {
        const queryParams = new URLSearchParams({
            limit: '10', // Default returns 10 per page
            offset: '0',
            remote: 'true', // Hardcoded as requested
        })

        if (params.q) {
            // Check for complex "OR" logic
            if (params.q.includes(' OR ')) {
                // Convert "Unquoted" OR "Quoted" OR ... to advanced filter format: ('A' | 'B')
                // 1. Replace double quotes with single quotes (API requirement for phrases)
                // 2. Replace OR with |
                // 3. Wrap in parenthesis
                const advancedQuery = `(${params.q.replace(/"/g, "'").replace(/ OR /g, ' | ')})`
                queryParams.append('advanced_title_filter', advancedQuery)
            } else {
                queryParams.append('title_filter', params.q)
            }
        }

        if (params.location) {
            queryParams.append('location_filter', params.location)
        }

        const url = `${BASE_URL}?${queryParams.toString()}`
        console.log(`[YCJobs] Request URL: ${url}`)

        const response = await fetch(url, {
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST,
            },
            next: { revalidate: 21600 }, // Cache for 6 hours (24 req/day limit -> cautious usage)
        })

        if (!response.ok) {
            console.error(`[YCJobs] API failed: ${response.status} ${response.statusText}`)
            return []
        }

        const data = await response.json() as YCJob[]
        if (!Array.isArray(data)) {
            console.warn(`[YCJobs] Unexpected response structure (not an array)`)
            return []
        }

        console.log(`[YCJobs] Success! Fetched ${data.length} jobs`)
        return data.map(transformJob)

    } catch (error) {
        console.error('Error fetching YC Jobs:', error)
        return []
    }
}

function transformJob(job: YCJob): Job {
    // Derive location
    const location = job.locations_derived?.[0] || job.job_location || job.location || 'Remote'

    const tags = ['Startup', 'YCombinator']
    if (job.employment_type) tags.push(...job.employment_type)

    return {
        id: `yc-${job.id}`,
        title: job.title,
        company: job.organization,
        location: location,
        category: [],
        job_type: job.employment_type?.[0] || 'Full-time',
        salary: null, // API doesn't seem to return salary often, or use AI fields if available (not seen in snippet)
        tags: tags,
        description_snippet: job.description_text?.slice(0, 300) + '...' || '',
        source: 'ycombinator',
        source_url: job.url,
        apply_url: job.url,
        published_at: job.date_posted,
        company_logo: job.organization_logo || null,
    }
}
