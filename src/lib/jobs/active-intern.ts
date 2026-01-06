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
            limit: '50',
            offset: '0',
            remote: 'true',
            description_type: 'text',
            include_ai: 'true',
            ai_work_arrangement_filter: 'Remote OK,Remote Solely',
            location_filter: 'United States' // US Only constraint
        })

        if (params.q) {
            if (params.q.includes(' OR ')) {
                const advancedQuery = `(${params.q.replace(/"/g, "'").replace(/ OR /g, ' | ')})`
                queryParams.append('advanced_title_filter', advancedQuery)
            } else {
                queryParams.append('title_filter', params.q)
            }
        }

        // Additional Post-Fetch Filters might be needed for logic not supported by API params
        // But here we rely on the API for query

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

        let data = await response.json() as ActiveInternJob[]
        if (!Array.isArray(data)) {
            console.warn(`[ActiveIntern] Unexpected response structure (not an array)`)
            return []
        }

        console.log(`[ActiveIntern] Success! Fetched ${data.length} jobs`)

        // Filter: Exclude "Workday"
        data = data.filter(job => {
            const isWorkday = (job.source && job.source.toLowerCase().includes('workday')) ||
                (job.url && job.url.includes('myworkdayjobs.com'))
            return !isWorkday
        })
        console.log(`[ActiveIntern] After Workday filter: ${data.length} jobs`)

        return data.map(transformJob)

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

    const tags = []
    if (job.employment_type) tags.push(...job.employment_type)
    return {
        id: `active-intern-${job.id}`,
        title: job.title,
        company: job.organization,
        location: job.location_derived?.[0] || 'Remote',
        category: [],
        job_type: 'Internship', // Always internship
        salary: salary,
        tags: tags,
        description_snippet: job.description_text?.slice(0, 300) + '...' || '',
        source: 'active-intern',
        source_url: job.url,
        apply_url: job.url,
        published_at: job.date_posted,
        company_logo: job.organization_logo || null,
    }
}
