import { Job, FetchJobsParams } from './types'

const API_KEY = process.env.ACTIVE_JOBS_API_KEY
const API_HOST = 'active-jobs-db.p.rapidapi.com'
const BASE_URL = `https://${API_HOST}/active-ats-7d`

interface ActiveJob {
    id: string
    title: string
    organization: string
    organization_logo?: string
    date_posted: string
    url: string
    description_text?: string
    description_html?: string
    salary_raw?: any
    ai_salary_value?: number
    ai_salary_currency?: string
    ai_salary_unittext?: string
    location_derived?: string[]
    employment_type?: string[]
    source?: string
}

export async function fetchActiveJobs(params: FetchJobsParams): Promise<Job[]> {
    if (!API_KEY) {
        console.warn('Active Jobs API Key is missing')
        return []
    }

    console.log(`[ActiveJobs] Fetching with params: ${JSON.stringify(params)}`)

    try {
        const queryParams = new URLSearchParams({
<<<<<<< HEAD
            limit: '50', // Fetch a decent chunk
            offset: '0',
            remote: 'true', // Force remote
            description_type: 'text', // We format it ourselves or use snippet
            include_ai: 'true', // For salary
            source: 'adp,greenhouse,workable', // User requested strict filtering
        })

        if (params.q) {
            queryParams.append('title_filter', params.q)
=======
            limit: '50', // Max per docs for this specific endpoint might vary, keeping safe
            offset: '0',
            remote: 'true',
            description_type: 'text',
            include_ai: 'true',
            source: 'adp,greenhouse,workable' // Strict source filter
        })

        if (params.q) {
            // Check for complex "OR" logic sent from page.tsx (quoted strings)
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
>>>>>>> akin-changes
        }

        if (params.location) {
            queryParams.append('location_filter', params.location)
        }

        const url = `${BASE_URL}?${queryParams.toString()}`
        console.log(`[ActiveJobs] Request URL: ${url}`)

        const response = await fetch(url, {
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST,
            },
            next: { revalidate: 86400 }, // Cache for 24 hours (Low limit: ~20-25 req/month)
        })

        if (!response.ok) {
            console.error(`[ActiveJobs] API failed: ${response.status} ${response.statusText}`)
            const text = await response.text()
            console.error(`[ActiveJobs] Error body: ${text}`)
            return []
        }

        const data = await response.json() as ActiveJob[]
        if (!Array.isArray(data)) {
            console.warn(`[ActiveJobs] Unexpected response structure (not an array)`)
            return []
        }

        console.log(`[ActiveJobs] Success! Fetched ${data.length} jobs`)
        return data.map(transformJob)

    } catch (error) {
        console.error('Error fetching Active Jobs:', error)
        return []
    }
}

function transformJob(job: ActiveJob): Job {
    let salary = null
    if (job.ai_salary_value && job.ai_salary_currency) {
        salary = `${job.ai_salary_currency} ${job.ai_salary_value.toLocaleString()} ${job.ai_salary_unittext || ''}`.trim()
    }

<<<<<<< HEAD
    return {
        id: job.id,
        title: job.title,
        company: job.organization,
        location: job.location_derived?.join(', ') || 'Remote',
        category: [], // API has taxonomies but we can skip mapping for now or map ai_taxonomies_a
        job_type: job.employment_type?.[0] || 'Full-time',
        salary: salary,
        tags: [],
=======
    const tags = []
    if (job.employment_type) tags.push(...job.employment_type)

    return {
        id: `active-${job.id}`,
        title: job.title,
        company: job.organization,
        location: job.location_derived?.[0] || 'Remote',
        category: [],
        job_type: job.employment_type?.[0] || 'Full-time',
        salary: salary,
        tags: tags,
>>>>>>> akin-changes
        description_snippet: job.description_text?.slice(0, 300) + '...' || '',
        source: 'fantastic-jobs',
        source_url: job.url,
        apply_url: job.url,
        published_at: job.date_posted,
        company_logo: job.organization_logo || null,
<<<<<<< HEAD
        // We could use ai_taxonomies_a_primary_filter for category if needed
=======
>>>>>>> akin-changes
    }
}
