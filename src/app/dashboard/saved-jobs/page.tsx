import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { JobCard } from '@/app/jobs/job-card'
import { Job } from '@/lib/jobs/types'

export default async function SavedJobsPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: savedJobs } = await supabase
        .from('saved_jobs')
        .select(`
            id,
            created_at,
            job:jobs (
                id,
                title,
                company_name,
                location,
                description,
                apply_url,
                tags,
                source,
                external_id,
                company_logo,
                salary_range,
                created_at
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    // Map DB result to Job type
    // Map DB result to Job type
    const jobs: Job[] = savedJobs?.map((item: any) => {
        if (!item.job) return null
        return {
            id: item.job.external_id,
            title: item.job.title,
            company: item.job.company_name,
            location: item.job.location,
            description_snippet: item.job.description,
            apply_url: item.job.apply_url,
            tags: item.job.tags || [],
            source: item.job.source,
            source_url: item.job.apply_url,
            published_at: item.job.created_at,
            company_logo: item.job.company_logo,
            salary: item.job.salary_range,
            job_type: 'Unknown',
            category: 'Unknown'
        }
    }).filter(Boolean) as Job[] || []

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Saved Jobs</h1>
                <p className="mt-2 text-muted-foreground">
                    Keep track of the roles you're interested in.
                </p>
            </div>

            <div className="space-y-4">
                {jobs.length === 0 ? (
                    <div className="text-center py-12 rounded-xl border border-white/10 bg-card/50">
                        <p className="text-muted-foreground text-lg">You haven't saved any jobs yet.</p>
                    </div>
                ) : (
                    jobs.map((job) => (
                        <JobCard key={job.id} job={job} isSaved={true} />
                    ))
                )}
            </div>
        </div>
    )
}
