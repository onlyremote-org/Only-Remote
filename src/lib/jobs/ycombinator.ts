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
        // OPTIMIZATION: "Internal Filtering"
        // We do NOT send search terms to the API to prevent cache fragmentation.
        // We always fetch the same "Top 50 Remote Jobs" URL.
        // This ensures Cache Hit Rate is nearly 100% and we stay under the 24 req/day limit.
        const queryParams = new URLSearchParams({
            limit: '50',
            offset: '0',
            remote: 'true',
        })

        // NOTE: We deliberately IGNORE params.q and params.location here when building the URL!
        // This keeps the URL identical for all users.

        const url = `${BASE_URL}?${queryParams.toString()}`
        console.log(`[YCJobs] Request URL (Generic): ${url}`)

        const response = await fetch(url, {
            headers: {
                'x-rapidapi-key': API_KEY || '', // Handle undefined key gracefully
                'x-rapidapi-host': API_HOST,
            },
            next: { revalidate: 21600 }, // Cache for 6 hours
        })

        if (!response.ok) {
            console.error(`[YCJobs] API failed: ${response.status} ${response.statusText}`)
            return []
        }

        let data = await response.json() as YCJob[]
        if (!Array.isArray(data)) {
            console.warn(`[YCJobs] Unexpected response structure (not an array)`)
            return []
        }

        console.log(`[YCJobs] Raw fetched: ${data.length} - Applying in-memory filters...`)

        // IN-MEMORY FILTERING
        // We filter the generic pool based on the specific user request
        if (params.q) {
            const queries = params.q.toLowerCase().split(' or ').map(s => s.trim().replace(/"/g, '')).filter(Boolean)
            data = data.filter(job => {
                const title = job.title?.toLowerCase() || ''
                const company = job.organization?.toLowerCase() || ''
                // Simple partial match
                return queries.some(q => title.includes(q) || company.includes(q))
            })
        }

        if (params.location) {
            const locQuery = params.location.toLowerCase()
            data = data.filter(job => {
                const loc = (job.locations_derived?.[0] || job.job_location || job.location || 'Remote').toLowerCase()
                return loc.includes(locQuery)
            })
        }

        console.log(`[YCJobs] Success! Returning ${data.length} jobs after filter`)
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
        salary: null, // API doesn't seem to return salary often
        tags: tags,
        description_snippet: job.description_text?.slice(0, 300) + '...' || '',
        source: 'ycombinator',
        source_url: job.url,
        apply_url: job.url,
        published_at: job.date_posted,
        company_logo: job.organization_logo || null,
    }
}
