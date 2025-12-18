'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Job } from '@/lib/jobs/types'

export async function toggleSavedJob(job: Job) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    // 1. Ensure job exists in DB
    // We use external_id to check/upsert
    const { data: dbJob, error: jobError } = await supabase
        .from('jobs')
        .select('id')
        .eq('external_id', job.id)
        .single()

    let jobId = dbJob?.id

    if (!jobId) {
        // Insert new job using Admin client to bypass RLS
        const { createAdminClient } = await import('@/lib/supabase/admin')
        const supabaseAdmin = createAdminClient()

        const { data: newJob, error: insertError } = await supabaseAdmin
            .from('jobs')
            .insert({
                title: job.title,
                company_name: job.company,
                location: job.location,
                description: job.description_snippet,
                apply_url: job.apply_url,
                tags: job.tags,
                source: job.source,
                external_id: job.id,
                company_logo: job.company_logo,
                salary_range: job.salary,
                created_at: job.published_at,
            })
            .select('id')
            .single()

        if (insertError) {
            console.error('Error inserting job:', insertError)
            console.error('Job Data:', JSON.stringify(job, null, 2))
            return { error: 'Failed to save job details: ' + insertError.message }
        }
        jobId = newJob.id
    }

    // 2. Toggle saved status
    const { data: existingSave } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('user_id', user.id)
        .eq('job_id', jobId)
        .single()

    if (existingSave) {
        // Unsave
        const { error: deleteError } = await supabase
            .from('saved_jobs')
            .delete()
            .eq('id', existingSave.id)

        if (deleteError) return { error: deleteError.message }
        revalidatePath('/dashboard')
        return { saved: false }
    } else {
        // Save
        const { error: insertError } = await supabase
            .from('saved_jobs')
            .insert({
                user_id: user.id,
                job_id: jobId,
            })

        if (insertError) return { error: insertError.message }
        revalidatePath('/dashboard')
        return { saved: true }
    }
}
