import { Job, FetchJobsParams } from './types'

const API_KEY = process.env.REMOTE_JOB_INTERN_API_KEY
const API_HOST = 'remote-jobs1.p.rapidapi.com'
const BASE_URL = `https://${API_HOST}/jobs`

interface Company {
    name: string
    logo?: string
}

interface RemoteInternJob {
    id: number
    title: string
    url: string
    description: string
    datePosted: string
    employmentTypes: string[]
    categories: string[]
    company: Company
    locationTypes: string[]
    countries: string[]
}

interface ApiResponse {
    total_count: number
    data: RemoteInternJob[]
}

export async function fetchRemoteInternJobs(params: FetchJobsParams): Promise<Job[]> {
    if (!API_KEY) {
        console.warn('Remote Job Intern API Key is missing')
        return []
    }

    console.log(`[RemoteIntern] Fetching with params: ${JSON.stringify(params)}`)

    try {
        const queryParams = new URLSearchParams({
            limit: '100', // Increased to get more/newer jobs
            include_total_count: 'false',
            include_company: 'true',
            country: 'us', // Default as per request
            employment_type: 'internship' // Default as per request
        })

        // NOTE: This API supports filtering, but we are primarily using it for "Internships".
        // The user reported seeing old jobs, so we bump the limit.
        // We also explicitly FILTER OUT SmartRecruiters as requested.

        const url = `${BASE_URL}?${queryParams.toString()}`
        console.log(`[RemoteIntern] Request URL: ${url}`)

        const response = await fetch(url, {
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST,
            },
            next: { revalidate: 86400 }, // Cache for 24 hours (Low limit: ~20-25 req/month)
        })

        if (!response.ok) {
            console.error(`[RemoteIntern] API failed: ${response.status} ${response.statusText}`)
            const text = await response.text()
            console.error(`[RemoteIntern] Error body: ${text}`)
            return []
        }

        const json = await response.json() as ApiResponse
        if (!json.data || !Array.isArray(json.data)) {
            console.warn(`[RemoteIntern] Unexpected response structure:`, Object.keys(json))
            return []
        }

        console.log(`[RemoteIntern] Success! Fetched ${json.data.length} jobs`)

        // Filter out SmartRecruiters (url or company name)
        const filteredData = json.data.filter(j => {
            const isSmartRecruiters = j.url?.includes('smartrecruiters') ||
                j.company?.name?.toLowerCase().includes('smartrecruiters')
            return !isSmartRecruiters
        })

        console.log(`[RemoteIntern] After SmartRecruiters filter: ${filteredData.length} jobs`)

        return filteredData.map(transformJob)

    } catch (error) {
        console.error('Error fetching Remote Intern Jobs:', error)
        return []
    }
}

function transformJob(job: RemoteInternJob): Job {
    // Basic HTML stripping for snippet
    const snippet = job.description
        ? job.description.replace(/<[^>]*>?/gm, '').slice(0, 300) + '...'
        : ''

    const location = [
        ...(job.locationTypes || []),
        ...(job.countries || [])
    ].join(', ') || 'Remote'

    return {
        id: `intern-${job.id}`, // Prefix to avoid collisions
        title: job.title,
        company: job.company?.name || 'Unknown',
        location: location,
        category: job.categories || [],
        job_type: 'Internship', // Explicitly set since we filtered for it
        salary: null, // API doesn't seem to provide salary in the example
        tags: [...(job.categories || []), 'Internship'],
        description_snippet: snippet,
        source: 'remote-intern',
        source_url: job.url,
        apply_url: job.url,
        published_at: job.datePosted,
        company_logo: job.company?.logo || null,
    }
}

