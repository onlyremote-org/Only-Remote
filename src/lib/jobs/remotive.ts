import { Job, FetchJobsParams } from './types'
import { stripHtml, makeSnippet } from './text'

// Docs: https://remotive.com/remote-jobs/api
// Endpoint: https://remotive.com/api/remote-jobs
// Params: search, category, limit

export async function fetchRemotiveJobs(params: FetchJobsParams): Promise<Job[]> {
    try {
        const url = new URL('https://remotive.com/api/remote-jobs')

        if (params.q) url.searchParams.append('search', params.q)
        if (params.category) url.searchParams.append('category', params.category)
        if (params.limit) url.searchParams.append('limit', params.limit.toString())

        const response = await fetch(url.toString(), { cache: 'no-store' })
        if (!response.ok) {
            console.error(`Remotive API error: ${response.statusText}`)
            return []
        }

        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
            console.error('Remotive API returned non-JSON response')
            return []
        }

        const data = await response.json()
        const jobs = data.jobs || []

        return jobs.map((job: any) => ({
            id: `remotive-${job.id}`,
            title: job.title,
            company: job.company_name,
            location: job.candidate_required_location,
            category: job.category,
            job_type: job.job_type,
            salary: job.salary,
            tags: job.tags || [],
            description_snippet: makeSnippet(stripHtml(job.description)),
            source: 'remotive',
            source_url: job.url,
            apply_url: job.url, // Remotive usually links to their page which has the apply button
            published_at: job.publication_date,
            company_logo: job.company_logo_url,
        }))
    } catch (error) {
        console.error('Error fetching Remotive jobs:', error)
        return []
    }
}
