import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Briefcase, FileText, Bookmark } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

    // Fetch stats
    const { count: savedJobsCount } = await supabase
        .from('saved_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    const { data: latestResume } = await supabase
        .from('resumes')
        .select('score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">
                    Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Here's what's happening with your job search today.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Stats Cards */}
                <Link href="/dashboard/saved-jobs" className="block group">
                    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-card p-6 shadow-lg transition-all hover:border-primary/20 hover:shadow-primary/5 group-hover:bg-white/5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Saved Jobs</p>
                                <p className="mt-2 text-3xl font-bold text-foreground">{savedJobsCount || 0}</p>
                            </div>
                            <div className="rounded-full bg-primary/10 p-3 text-primary">
                                <Bookmark className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                </Link>

                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-card p-6 shadow-lg transition-all hover:border-primary/20 hover:shadow-primary/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Resume Score</p>
                            <p className="mt-2 text-3xl font-bold text-foreground">
                                {latestResume?.score ? `${latestResume.score}%` : 'N/A'}
                            </p>
                        </div>
                        <div className="rounded-full bg-green-500/10 p-3 text-green-400">
                            <FileText className="h-6 w-6" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
