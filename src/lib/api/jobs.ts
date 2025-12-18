import { createClient } from '@/lib/supabase/server'

export interface Job {
    id: string
    title: string
    company_name: string
    location: string
    salary_range: string | null
    description: string
    apply_url: string
    tags: string[] | null
    created_at: string
    company_logo: string | null
}

export async function getJobs(): Promise<Job[]> {
    const supabase = await createClient()

    const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching jobs:', error)
        return []
    }

    // Return mock data if no jobs in DB (for development)
    if (!jobs || jobs.length === 0) {
        return [
            {
                id: '1',
                title: 'Senior Frontend Engineer',
                company_name: 'TechCorp',
                location: 'Remote',
                salary_range: '$120k - $160k',
                description: 'We are looking for a Senior Frontend Engineer to join our team...',
                apply_url: '#',
                tags: ['React', 'TypeScript', 'Next.js'],
                created_at: new Date().toISOString(),
                company_logo: null,
            },
            {
                id: '2',
                title: 'Product Designer',
                company_name: 'DesignStudio',
                location: 'Remote',
                salary_range: '$100k - $140k',
                description: 'Join our award-winning design team...',
                apply_url: '#',
                tags: ['Figma', 'UI/UX', 'Product Design'],
                created_at: new Date().toISOString(),
                company_logo: null,
            },
            {
                id: '3',
                title: 'Backend Developer',
                company_name: 'DataSystems',
                location: 'Remote',
                salary_range: '$130k - $170k',
                description: 'Build scalable backend systems...',
                apply_url: '#',
                tags: ['Node.js', 'PostgreSQL', 'AWS'],
                created_at: new Date().toISOString(),
                company_logo: null,
            },
        ]
    }

    return jobs
}

export async function getJob(id: string): Promise<Job | null> {
    const supabase = await createClient()

    const { data: job, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !job) {
        // Check mock data
        const mockJobs = [
            {
                id: '1',
                title: 'Senior Frontend Engineer',
                company_name: 'TechCorp',
                location: 'Remote',
                salary_range: '$120k - $160k',
                description: 'We are looking for a Senior Frontend Engineer to join our team...',
                apply_url: '#',
                tags: ['React', 'TypeScript', 'Next.js'],
                created_at: new Date().toISOString(),
                company_logo: null,
            },
            {
                id: '2',
                title: 'Product Designer',
                company_name: 'DesignStudio',
                location: 'Remote',
                salary_range: '$100k - $140k',
                description: 'Join our award-winning design team...',
                apply_url: '#',
                tags: ['Figma', 'UI/UX', 'Product Design'],
                created_at: new Date().toISOString(),
                company_logo: null,
            },
            {
                id: '3',
                title: 'Backend Developer',
                company_name: 'DataSystems',
                location: 'Remote',
                salary_range: '$130k - $170k',
                description: 'Build scalable backend systems...',
                apply_url: '#',
                tags: ['Node.js', 'PostgreSQL', 'AWS'],
                created_at: new Date().toISOString(),
                company_logo: null,
            },
        ]
        return mockJobs.find(j => j.id === id) || null
    }

    return job
}
