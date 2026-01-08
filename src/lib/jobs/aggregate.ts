import { Job, FetchJobsParams } from './types'
import { fetchRemotiveJobs } from './remotive'
import { fetchRemoteOKJobs } from './remoteok'
import { fetchHimalayasJobs } from './himalayas'
import { fetchOpenWebNinjaJobs } from './openwebninja'
import { fetchH1BJobs } from './h1b'
import { fetchActiveJobs } from './active-jobs'
import { fetchRemoteInternJobs } from './remote-intern'
import { fetchActiveInternJobs } from './active-intern'
import { fetchSponsorshipJobs } from './sponsorship-all'

export async function fetchAggregatedJobs(params: FetchJobsParams & { sources?: string[] }): Promise<{ jobs: Job[], total: number }> {
    const sources = params.sources || ['remotive', 'remoteok', 'himalayas', 'openwebninja', 'fantastic-jobs', 'remote-intern', 'active-intern', 'job-feed-sponsorship']

    const promises: Promise<Job[]>[] = []
    if (params.q) {
        const queries = params.q.toLowerCase().split(' or ').map(s => s.trim().replace(/"/g, '')).filter(Boolean)
        queries.forEach(query => {
            if (sources.includes('remotive')) promises.push(fetchRemotiveJobs({ ...params, q: query }))
            if (sources.includes('remoteok')) promises.push(fetchRemoteOKJobs({ ...params, q: query }))
            // if (sources.includes('himalayas')) promises.push(fetchHimalayasJobs(params))
            if (sources.includes('openwebninja')) promises.push(fetchOpenWebNinjaJobs({ ...params, q: query }))
        })
    } else {
        if (sources.includes('remotive')) promises.push(fetchRemotiveJobs(params))
        if (sources.includes('remoteok')) promises.push(fetchRemoteOKJobs(params))
        // if (sources.includes('himalayas')) promises.push(fetchHimalayasJobs(params))
        if (sources.includes('openwebninja')) promises.push(fetchOpenWebNinjaJobs(params))
    }
    if (sources.includes('fantastic-jobs')) promises.push(fetchActiveJobs(params))
    if (sources.includes('remote-intern')) promises.push(fetchRemoteInternJobs(params))
    if (sources.includes('active-intern')) promises.push(fetchActiveInternJobs(params))
    if (sources.includes('job-feed-sponsorship')) promises.push(fetchSponsorshipJobs(params))

    // Always fetch H1B if not explicitly excluded, or if specifically requested
    // For now, we'll just add it to the mix
    promises.push(fetchH1BJobs(params))

    const results = await Promise.allSettled(promises)

    let allJobs: Job[] = []

    results.forEach(result => {
        if (result.status === 'fulfilled') {
            allJobs = [...allJobs, ...result.value]
        }
    })

    // Deduplicate by ID and Semantics (Title + Company)
    const seenIds = new Set<string>()
    const seenSignatures = new Set<string>()
    const uniqueJobs: Job[] = []

    allJobs.forEach(job => {
        // 1. Check ID
        if (seenIds.has(job.id)) return

        // 2. Check Semantic Signature (Title + Company)
        // This handles multi-location duplicates (e.g. "Software Engineer" at "Google" listed 5 times)
        const signature = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}`
        if (seenSignatures.has(signature)) return

        seenIds.add(job.id)
        seenSignatures.add(signature)
        uniqueJobs.push(job)
    })

    // Filter jobs
    let filteredJobs = uniqueJobs

    if (params.q) {
        // Support "OR" logic by splitting on " OR "
        // If query contains "/", treat parts as OR (e.g., "ui/ux" → ["ui", "ux"])
        // Also remove quotes from phrases (e.g., "Product Manager" → Product Manager)
        const queries = params.q.toLowerCase().split(' or ').flatMap(q => {
            const cleaned = q.trim().replace(/"/g, '')
            if (cleaned.includes('/')) {
                return cleaned.split('/').map(s => s.trim())
            }
            return [cleaned]
        }).filter(Boolean)

        filteredJobs = filteredJobs.filter(job => {
            return queries.some(query =>
                (job.title && job.title.toLowerCase().includes(query)) ||
                (job.company && job.company.toLowerCase().includes(query)) ||
                (job.tags && job.tags.some(tag => tag.toLowerCase().includes(query)))
            )
        })
    }

    if (params.location) {
        const locationQuery = params.location.toLowerCase()
        filteredJobs = filteredJobs.filter(job =>
            (job.location && job.location.toLowerCase().includes(locationQuery))
        )
    }

    if (params.job_type && params.job_type !== 'h1b') {
        const typeQuery = params.job_type.toLowerCase().replace(/[-_]/g, ' ')

        if (params.job_type === 'internship') {
            filteredJobs = filteredJobs.filter(job =>
                (job.title && job.title.toLowerCase().includes('intern')) ||
                (job.job_type && job.job_type.toLowerCase().includes('intern')) ||
                (job.tags && job.tags.some(tag => tag.toLowerCase().includes('intern')))
            )
        } else if (params.job_type === 'global-sponsorship') {
            filteredJobs = filteredJobs.filter(job =>
                job.tags && job.tags.includes('Global Sponsorship')
            )
        } else {
            filteredJobs = filteredJobs.filter(job =>
                job.job_type?.toLowerCase().replace(/[-_]/g, ' ').includes(typeQuery)
            )
        }
    }

    if (params.h1b) {
        console.log('[Aggregator] Filtering for H1B jobs...')
        filteredJobs = filteredJobs.filter(job => {
            const hasTag = job.tags && job.tags.includes('H1B')
            if (hasTag) console.log(`[Aggregator] Found H1B job: ${job.title}`)
            return hasTag
        })
        console.log(`[Aggregator] Jobs after H1B filter: ${filteredJobs.length}`)
    }

    // Sort jobs
    // Sort jobs by date first to group them
    filteredJobs.sort((a, b) => {
        const dateA = new Date(a.published_at).getTime()
        const dateB = new Date(b.published_at).getTime()
        return dateB - dateA // Newest first
    })

    if (params.sort === 'newest' || !params.sort) {
        // Implement "Daily Round Robin" mixing
        // 1. Group by Day
        const jobsByDay: Record<string, Job[]> = {}
        filteredJobs.forEach(job => {
            const day = new Date(job.published_at).toISOString().split('T')[0]
            if (!jobsByDay[day]) jobsByDay[day] = []
            jobsByDay[day].push(job)
        })

        // 2. For each day, mix sources
        let mixedJobs: Job[] = []
        const sortedDays = Object.keys(jobsByDay).sort().reverse() // Newest day first

        sortedDays.forEach(day => {
            const dayJobs = jobsByDay[day]
            const jobsBySource: Record<string, Job[]> = {}

            // Group by source within the day
            dayJobs.forEach(job => {
                if (!jobsBySource[job.source]) jobsBySource[job.source] = []
                jobsBySource[job.source].push(job)
            })

            // Round robin pick
            const sources = Object.keys(jobsBySource)
            let hasJobs = true
            while (hasJobs) {
                hasJobs = false
                for (const source of sources) {
                    if (jobsBySource[source].length > 0) {
                        mixedJobs.push(jobsBySource[source].shift()!)
                        hasJobs = true
                    }
                }
            }
        })

        filteredJobs = mixedJobs
    } else {
        // Oldest first - just simple sort
        filteredJobs.sort((a, b) => {
            const dateA = new Date(a.published_at).getTime()
            const dateB = new Date(b.published_at).getTime()
            return dateA - dateB
        })
    }

    const total = filteredJobs.length

    // Apply Pagination
    if (params.page && params.limit) {
        const startIndex = (params.page - 1) * params.limit
        const endIndex = startIndex + params.limit
        filteredJobs = filteredJobs.slice(startIndex, endIndex)
    } else if (params.limit) {
        filteredJobs = filteredJobs.slice(0, params.limit)
    }

    console.log(`[Aggregator] Params: ${JSON.stringify(params)}`)
    console.log(`[Aggregator] Total: ${allJobs.length}, Unique: ${uniqueJobs.length}, Filtered Total: ${total}, Returned: ${filteredJobs.length}`)

    return { jobs: filteredJobs, total }
}
