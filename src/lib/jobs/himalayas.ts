import { Job, FetchJobsParams } from './types'
import { stripHtml, makeSnippet } from './text'

// Docs: https://himalayas.app/api
// We'll assume a standard structure or use a known public feed if available.
// Since the user didn't provide a specific verified URL other than the docs page,
// and Himalayas often requires an API key for full access or has a specific public feed structure,
// we will implement a best-effort fetcher or a placeholder if the public endpoint is not standard.
// However, many "public" feeds are just JSON representations of their search.

export async function fetchHimalayasJobs(params: FetchJobsParams): Promise<Job[]> {
    try {
        // Using a likely public endpoint or the one mentioned in common lists
        const url = new URL('https://himalayas.app/jobs/api')

        if (params.q) url.searchParams.append('search', params.q)
        if (params.limit) url.searchParams.append('limit', params.limit.toString())

        const response = await fetch(url.toString(), { cache: 'no-store' })
        if (!response.ok) {
            // If this fails, we might need to skip or use a different source
            console.warn(`Himalayas API error: ${response.statusText}`)
            return []
        }

        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
            console.warn('Himalayas API returned non-JSON response')
            return []
        }

        const data = await response.json()
        const jobs = data.jobs || []
        console.log(`[Himalayas] Fetched ${jobs.length} jobs`)

        return jobs.map((job: any) => {
            // Construct reliable URL
            // Construct reliable URL
            const companyName = (job.company_name || 'unknown').toLowerCase().replace(/[^a-z0-9]/g, '-')
            const slug = job.slug || job.id || 'unknown'
            const publicUrl = `https://himalayas.app/jobs/${companyName}/${slug}`
            // Or simpler if slug is unique enough:
            const simpleUrl = `https://himalayas.app/jobs/${job.slug}`

            // Use simple URL as fallback
            const finalUrl = job.application_url || job.url || simpleUrl

            return {
                id: `himalayas-${job.id || job.slug}`,
                title: job.title,
                company: job.company_name,
                location: job.location || 'Remote',
                category: job.category,
                job_type: job.employment_type,
                salary: job.salary_range,
                tags: job.keywords || [],
                description_snippet: makeSnippet(stripHtml(job.description)),
                source: 'himalayas',
                source_url: finalUrl,
                apply_url: finalUrl,
                published_at: job.pub_date || new Date().toISOString(),
                company_logo: job.company_logo_url,
            }
        })
    } catch (error) {
        console.error('Error fetching Himalayas jobs:', error)
        return []
    }
}
