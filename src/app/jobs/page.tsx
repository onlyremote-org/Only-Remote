import Link from 'next/link'
import { fetchAggregatedJobs } from '@/lib/jobs/aggregate'
import { Job } from '@/lib/jobs/types'

import { JobsFilter } from './jobs-filter'
import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import { JobsSidebarLayout } from '@/components/jobs-sidebar-layout'
import { PaginationControls } from '@/components/pagination-controls'
import { JobsList } from './jobs-list'


export default async function JobsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const searchParams = await props.searchParams
    const q = typeof searchParams.q === 'string' ? searchParams.q : undefined
    const location = typeof searchParams.location === 'string' ? searchParams.location : undefined
    const jobType = typeof searchParams.job_type === 'string' ? searchParams.job_type : undefined
    const sort = typeof searchParams.sort === 'string' ? (searchParams.sort as 'newest' | 'oldest') : undefined
    const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1
    const limit = 24

    // Handle H-1B filter from dropdown (job_type=h1b) or legacy param
    const h1b = searchParams.h1b === 'true' || jobType === 'h1b'

    // Fetch jobs and user data in parallel
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let userPreferences: string[] = []
    // Only fetch preferences if user is logged in and hasn't explicitly searched for a term.
    // We allow preferences to apply even if location/job_type filters are active, 
    // effectively making "Internship" mean "Internships matching my preferences".
    if (user && !q) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('job_preferences')
            .eq('id', user.id)
            .single()

        if (profile?.job_preferences && profile.job_preferences.length > 0) {
            userPreferences = profile.job_preferences
        }
    }

    const effectiveQ = q || (userPreferences.length > 0
        ? userPreferences.map(p => p.includes(' ') ? `"${p}"` : p).join(' OR ')
        : undefined)

    const { jobs, total } = await fetchAggregatedJobs({
        limit,
        page,
        q: effectiveQ,
        location,
        job_type: jobType,
        sort,
        h1b
    })

    const totalPages = Math.ceil(total / limit)

    // Fetch saved jobs, profile, and resume if user is logged in
    const savedJobIds = new Set<string>()
    let userName = ''
    let resumeSkills: string[] = []

    if (user) {
        const [savedResponse, profileResponse, resumeResponse] = await Promise.all([
            supabase
                .from('saved_jobs')
                .select(`
                    job:jobs (
                        external_id
                    )
                `)
                .eq('user_id', user.id),
            supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user.id)
                .single(),
            supabase
                .from('resumes')
                .select('analysis')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()
        ])

        if (savedResponse.data) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            savedResponse.data.forEach((item: any) => {
                if (item.job?.external_id) savedJobIds.add(item.job.external_id)
            })
        }

        if (profileResponse.data) {
            userName = profileResponse.data.full_name || ''
        } else if (user.user_metadata?.full_name) {
            userName = user.user_metadata.full_name
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (resumeResponse.data?.analysis && (resumeResponse.data.analysis as any).extracted_skills) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            resumeSkills = (resumeResponse.data.analysis as any).extracted_skills.map((s: string) => s.toLowerCase())
        }
    }



    return (
        <JobsSidebarLayout user={user}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Find Your Next <span className="text-primary">Remote</span> Role
                    </h2>
                    <p className="mt-4 text-lg leading-8 text-muted-foreground">
                        {userPreferences.length > 0 && !q ? (
                            <span>
                                Recommended for you based on your preferences: {' '}
                                {userPreferences.map((pref, index) => (
                                    <span key={pref}>
                                        <Link
                                            href="/dashboard/preferences"
                                            className="font-medium text-primary hover:underline hover:text-primary/80 transition-colors"
                                        >
                                            {pref}
                                        </Link>
                                        {index < userPreferences.length - 1 && ', '}
                                    </span>
                                ))}
                            </span>
                        ) : (
                            "Curated remote jobs from the best sources across the web."
                        )}
                    </p>
                </div>

                <Suspense fallback={<div className="h-20 bg-card/50 animate-pulse rounded-xl mb-8" />}>
                    <JobsFilter />
                </Suspense>

                <div className="space-y-8">
                    {jobs.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground text-lg">No jobs found matching your criteria.</p>
                        </div>
                    ) : (
                        <>
                            <>
                                <JobsList
                                    jobs={jobs}
                                    savedJobIds={savedJobIds}
                                    userName={userName}
                                    resumeSkills={resumeSkills}
                                    page={page}
                                    totalPages={totalPages}
                                />
                            </>
                        </>
                    )}
                </div>
            </div>
        </JobsSidebarLayout>
    )
}
