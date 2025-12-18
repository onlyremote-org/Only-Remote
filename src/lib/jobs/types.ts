export interface Job {
    id: string
    title: string
    company: string
    location: string
    category: string | string[]
    job_type: string | null
    salary: string | null
    tags: string[]
    description_snippet: string
    source: 'remotive' | 'remoteok' | 'himalayas' | 'openwebninja' | 'other'
    source_url: string
    apply_url: string
    published_at: string
    company_logo?: string | null
}

export interface FetchJobsParams {
    q?: string
    category?: string
    location?: string
    page?: number
    pageSize?: number
    limit?: number
    sort?: 'newest' | 'oldest'
    job_type?: string
    h1b?: boolean
}
