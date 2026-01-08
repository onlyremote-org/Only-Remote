import { Job, FetchJobsParams } from './types'
import { stripHtml, makeSnippet } from './text'

// Docs: https://www.freepublicapis.com/remote-ok-jobs-api
// Endpoint: https://remoteok.com/api
// Note: The first item in the response is often metadata (legal, etc.)

export async function fetchRemoteOKJobs(params: FetchJobsParams): Promise<Job[]> {
    try {
        // RemoteOK doesn't support standard query params easily via this endpoint in the same way,
        // but we can try passing 'tag' or just filter client-side if needed.
        // For this implementation, we'll fetch the feed and filter if possible or just return latest.
        const url = new URL('https://remoteok.com/api')

        // RemoteOK supports 'tag' param for category/search
        if (params.q) url.searchParams.append('tag', params.q)
        else if (params.category) url.searchParams.append('tag', params.category)

        const response = await fetch(url.toString(), {
            headers: {
                'User-Agent': 'OnlyRemote/1.0 (https://onlyremote.org)',
            },
            cache: 'default'
        })

        if (!response.ok) {
            console.error(`RemoteOK API error: ${response.statusText}`)
            return []
        }

        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
            console.error('RemoteOK API returned non-JSON response')
            return []
        }

        const data = await response.json()
        // Filter out metadata object (usually has no id or company)
        const jobs = Array.isArray(data) ? data.filter((item: any) => item.company && item.position) : []

        return jobs.map((job: any) => ({
            id: `remoteok-${job.id}`,
            title: job.position,
            company: job.company,
            location: job.location,
            category: job.tags ? job.tags[0] : 'Unknown', // Use first tag as category
            job_type: null, // RemoteOK doesn't always specify
            salary: job.salary_min && job.salary_max ? `$${job.salary_min} - $${job.salary_max}` : null,
            tags: job.tags || [],
            description_snippet: makeSnippet(stripHtml(job.description)),
            source: 'remoteok',
            source_url: job.url,
            apply_url: job.apply_url || job.url,
            published_at: job.date,
            company_logo: job.company_logo,
        }))
    } catch (error) {
        console.error('Error fetching RemoteOK jobs:', error)
        return []
    }
}
