import { Job, FetchJobsParams } from './types'

const API_KEY = process.env.ACTIVE_INTERN_API_KEY
const API_HOST = 'internships-api.p.rapidapi.com'
const BASE_URL = `https://${API_HOST}/active-ats-7d`

interface ActiveInternJob {
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

export async function fetchActiveInternJobs(params: FetchJobsParams): Promise<Job[]> {
    if (!API_KEY) {
        console.warn('Active Intern API Key is missing')
        return []
    }

    console.log(`[ActiveIntern] Fetching with params: ${JSON.stringify(params)}`)

    try {
        const queryParams = new URLSearchParams({
            limit: '50', // Max allowed per docs (or close to it)
            offset: '0',
            remote: 'true', // Force remote
            description_type: 'text',
            include_ai: 'true',
            ai_work_arrangement_filter: 'Remote OK,Remote Solely', // Granular remote filter
            location_filter: 'United States', // User requested US only
        })

        if (params.q) {
            queryParams.append('title_filter', params.q)
        }

        // We ignore params.location here because we are FORCING United States as per user request
        // if (params.location) {
        //     queryParams.append('location_filter', params.location)
        // }

        const url = `${BASE_URL}?${queryParams.toString()}`
        console.log(`[ActiveIntern] Request URL: ${url}`)

        const response = await fetch(url, {
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST,
            },
            next: { revalidate: 14400 }, // Cache for 4 hours (200 req/month = ~6 req/day)
        })

        if (!response.ok) {
            console.error(`[ActiveIntern] API failed: ${response.status} ${response.statusText}`)
            const text = await response.text()
            console.error(`[ActiveIntern] Error body: ${text}`)
            return []
        }

        const data = await response.json() as ActiveInternJob[]
        if (!Array.isArray(data)) {
            console.warn(`[ActiveIntern] Unexpected response structure (not an array)`)
            return []
        }

        console.log(`[ActiveIntern] Success! Fetched ${data.length} jobs`)

        // Filter out Workday jobs as requested
        const filteredData = data.filter(job => {
            const isWorkday = job.url?.includes('myworkdayjobs') ||
                job.url?.includes('workday.com') ||
                job.organization?.toLowerCase().includes('workday')
            return !isWorkday
        })

        console.log(`[ActiveIntern] After Workday filter: ${filteredData.length} jobs`)

        return filteredData.map(transformJob)

    } catch (error) {
        console.error('Error fetching Active Intern Jobs:', error)
        return []
    }
}

function transformJob(job: ActiveInternJob): Job {
    let salary = null
    if (job.ai_salary_value && job.ai_salary_currency) {
        salary = `${job.ai_salary_currency} ${job.ai_salary_value.toLocaleString()} ${job.ai_salary_unittext || ''}`.trim()
    }

    return {
        id: `active-intern-${job.id}`,
        title: job.title,
        company: job.organization,
        location: job.location_derived?.join(', ') || 'Remote',
        category: [],
        job_type: 'Internship', // It's an internship API
        salary: salary,
        tags: ['Internship'],
        description_snippet: job.description_text?.slice(0, 300) + '...' || '',
        source: 'active-intern',
        source_url: job.url,
        apply_url: job.url,
        published_at: job.date_posted,
        company_logo: job.organization_logo || null,
    }
}
