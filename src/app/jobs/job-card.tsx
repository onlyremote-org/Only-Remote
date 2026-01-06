'use client'

import { useState } from 'react'
import { Job } from '@/lib/jobs/types'
import { Bookmark, FileText } from 'lucide-react'
import { toggleSavedJob } from './actions'
import { cn } from '@/lib/utils'

interface JobCardProps {
    job: Job
    isSaved?: boolean
    userName?: string
    matchScore?: number | null
    onGenerateCoverLetter?: (job: Job) => void
    onViewJob?: (job: Job) => void
}

export function JobCard({ job, isSaved: initialSaved = false, userName = '', matchScore, onGenerateCoverLetter, onViewJob }: JobCardProps) {
    const [isSaved, setIsSaved] = useState(initialSaved)
    const [isLoading, setIsLoading] = useState(false)

    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault() // Prevent navigation
        setIsLoading(true)
        try {
            const result = await toggleSavedJob(job)
            if (result.saved !== undefined) {
                setIsSaved(result.saved)
            }
        } catch (error) {
            console.error('Error saving job:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const hasLogo = Boolean(job.company_logo)

    return (
        <div className="group relative bg-card p-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300 sm:rounded-xl border border-border shadow-sm flex flex-col h-full">
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex gap-4 items-start flex-1 min-w-0">
                    <div className="flex-shrink-0">
                        {hasLogo ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={job.company_logo!}
                                alt={`${job.company} logo`}
                                className="h-14 w-14 rounded-xl object-contain bg-white border border-border p-1"
                            />
                        ) : (
                            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border border-primary/20">
                                {(job.company ? job.company.charAt(0).toUpperCase() : 'C')}
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-1 pr-2">
                            <a
                                href={job.apply_url}
                                onClick={(e) => {
                                    if (onViewJob) {
                                        e.preventDefault()
                                        onViewJob(job)
                                    }
                                }}
                                className="focus:outline-none"
                            >
                                <span className="absolute inset-0" aria-hidden="true" />
                                {job.title}
                            </a>
                        </h3>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-muted-foreground truncate">{job.company}</p>
                            {matchScore !== undefined && matchScore !== null && (
                                <span className={cn(
                                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
                                    matchScore >= 80 ? "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-400/20" :
                                        matchScore >= 50 ? "bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-900/30 dark:text-yellow-500 dark:ring-yellow-400/20" :
                                            "bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-900/30 dark:text-gray-400 dark:ring-gray-400/20"
                                )}>
                                    {matchScore}% Match
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0 relative z-10 flex items-center gap-1">
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            onGenerateCoverLetter?.(job)
                        }}
                        className="p-2 rounded-full bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors"
                        title="Generate AI Cover Letter"
                    >
                        <FileText className="h-5 w-5" />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className={cn(
                            "p-2 rounded-full transition-colors",
                            isSaved
                                ? "bg-primary/10 text-primary hover:bg-primary/20"
                                : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                        )}
                        title={isSaved ? "Unsave job" : "Save job"}
                    >
                        <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
                    </button>
                </div>
            </div>

            <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/30 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/20">
                        {job.location || 'Remote'}
                    </span>
                    {job.salary && (
                        <span className="inline-flex items-center rounded-md bg-green-50 dark:bg-green-900/30 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/20">
                            {job.salary}
                        </span>
                    )}
                    {job.job_type && (
                        <span className="inline-flex items-center rounded-md bg-purple-50 dark:bg-purple-900/30 px-2 py-1 text-xs font-medium text-purple-700 dark:text-purple-300 ring-1 ring-inset ring-purple-700/10 dark:ring-purple-400/20">
                            {job.job_type}
                        </span>
                    )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {job.description_snippet}
                </p>
            </div>

            <div className="mt-auto pt-4 border-t border-border flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{new Date(job.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span>•</span>
                    <span>via {job.source}</span>
                </div>


            </div>
        </div>
    )
}
