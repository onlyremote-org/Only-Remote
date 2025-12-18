import { Job, FetchJobsParams } from './types'
import { stripHtml, makeSnippet } from './text'

// Docs: https://www.openwebninja.com/api/remote-jobs
// This often requires an API key via RapidAPI or direct. 
// If it requires a key that we don't have, this might fail.
// We'll implement it assuming it might work or return empty if auth is needed and missing.

export async function fetchOpenWebNinjaJobs(params: FetchJobsParams): Promise<Job[]> {
    try {
        const url = new URL('https://www.openwebninja.com/api/remote-jobs')

        if (params.q) url.searchParams.append('search', params.q)
        if (params.limit) url.searchParams.append('limit', params.limit.toString())

        const response = await fetch(url.toString(), { cache: 'no-store' })
        if (!response.ok) {
            console.warn(`OpenWeb Ninja API error: ${response.statusText}`)
            return []
        }

        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
            console.warn('OpenWeb Ninja API returned non-JSON response')
            return []
        }

        const data = await response.json()
        const jobs = data.jobs || []

        return jobs.map((job: any) => ({
            id: `own-${job.id}`,
            title: job.title,
            company: job.company,
            location: job.location,
            category: job.category,
            job_type: job.type,
            salary: job.salary,
            tags: job.tags || [],
            description_snippet: makeSnippet(stripHtml(job.description)),
            source: 'openwebninja',
            source_url: job.url,
            apply_url: job.apply_url || job.url,
            published_at: job.posted_at || new Date().toISOString(),
            company_logo: job.logo,
        }))
    } catch (error) {
        console.error('Error fetching OpenWeb Ninja jobs:', error)
        return []
    }
}
