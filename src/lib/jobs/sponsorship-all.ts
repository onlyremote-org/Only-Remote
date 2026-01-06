import { Job, FetchJobsParams } from './types'

const API_KEY = process.env.JOB_FEED_SPONSORSHIP_API_KEY
const API_HOST = 'job-posting-feed-api.p.rapidapi.com'
const BASE_URL = `https://${API_HOST}/active-ats-6m`

interface SponsorshipJob {
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
    locations_derived?: { city?: string, admin?: string, country: string }[] // Per docs
    employment_type?: string[]
    source?: string
    ai_visa_sponsorship?: boolean
}

export async function fetchSponsorshipJobs(params: FetchJobsParams): Promise<Job[]> {
    if (!API_KEY) {
        console.warn('Job Feed Sponsorship API Key is missing')
        return []
    }

    console.log(`[SponsorshipAll] Fetching with params: ${JSON.stringify(params)}`)

    try {
        const queryParams = new URLSearchParams({
            limit: '500', // Max allowed per docs (Basic plan)
            offset: '0',
            remote: 'true',
            description_type: 'text',
            include_ai: 'true',
            ai_work_arrangement_filter: 'Remote OK,Remote Solely',
            ai_visa_sponsorship_filter: 'true', // The key Requirement
        })

        if (params.q) {
            queryParams.append('title_filter', params.q)
        }

        if (params.location) {
            queryParams.append('location_filter', params.location)
        }

        const url = `${BASE_URL}?${queryParams.toString()}`
        console.log(`[SponsorshipAll] Request URL: ${url}`)

        const response = await fetch(url, {
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST,
            },
            // LIMIT IS 5 REQUESTS PER MONTH!
            // We must cache for ~7 days to be safe.
            // 7 days = 604800 seconds
            next: { revalidate: 604800 },
        })

        if (!response.ok) {
            console.error(`[SponsorshipAll] API failed: ${response.status} ${response.statusText}`)
            const text = await response.text()
            console.error(`[SponsorshipAll] Error body: ${text}`)
            return []
        }

        const data = await response.json() as SponsorshipJob[]
        if (!Array.isArray(data)) {
            console.warn(`[SponsorshipAll] Unexpected response structure (not an array)`)
            return []
        }

        console.log(`[SponsorshipAll] Success! Fetched ${data.length} jobs`)
        return data.map(transformJob)

    } catch (error) {
        console.error('Error fetching Sponsorship Jobs:', error)
        return []
    }
}

function transformJob(job: SponsorshipJob): Job {
    let salary = null
    if (job.ai_salary_value && job.ai_salary_currency) {
        salary = `${job.ai_salary_currency} ${job.ai_salary_value.toLocaleString()} ${job.ai_salary_unittext || ''}`.trim()
    }

    // Determine location and Visa Logic
    // API docs say: locations_derived is text[] [{city, admin (state), country}]
    // But sometimes it might be just strings. We'll handle both.

    // We check if ANY derived location is US
    let isUS = false
    let locationString = 'Remote'

    if (job.location_derived && Array.isArray(job.location_derived)) {
        // Convert to string for easy checking
        const locStr = JSON.stringify(job.location_derived).toLowerCase()
        if (locStr.includes('united states') || locStr.includes('"country":"us"')) {
            isUS = true
        }

        // Try to make a readable string
        // The API returns complex objects sometimes, but our type defines it as string[] in other places?
        // Let's safe-map it.
        locationString = job.location_derived.map(l => {
            if (typeof l === 'string') return l
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (typeof l === 'object') return (l as any).country || 'Unknown'
            return ''
        }).join(', ') || 'Remote'
    }

    // Tag Logic
    // User wants: USA -> H1B
    // Other -> "Other Country Visa Sponsorship"
    const tags = ['Visa Sponsorship']
    if (isUS) {
        tags.push('H1B')
    } else {
        tags.push('Global Sponsorship') // Cleaner name than "Other Country..."
    }

    if (job.employment_type) tags.push(...job.employment_type)

    return {
        id: `sponsor-${job.id}`,
        title: job.title,
        company: job.organization,
        location: locationString || 'Remote',
        category: [],
        job_type: job.employment_type?.[0] || 'Full-time',
        salary: salary,
        tags: tags,
        description_snippet: job.description_text?.slice(0, 300) + '...' || '',
        source: 'job-feed-sponsorship',
        source_url: job.url,
        apply_url: job.url,
        published_at: job.date_posted,
        company_logo: job.organization_logo || null,
        // Important: this job ALWAYS has H1B/Sponsorship if it came from this API
    }
}
