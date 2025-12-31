'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Job } from '@/lib/jobs/types'
import { ExternalLink, X, Building2, MapPin, DollarSign, Briefcase } from 'lucide-react'
import { Button } from './ui/button'
import { useState } from 'react'

interface JobDetailModalProps {
    isOpen: boolean
    onClose: () => void
    job: Job
}

export function JobDetailModal({ isOpen, onClose, job }: JobDetailModalProps) {
    const [iframeError, setIframeError] = useState(false)

    const UNEMBEDDABLE_DOMAINS = [
        'workday.com',
        'myworkdayjobs.com', // Covers *.wd5.myworkdayjobs.com
        'join.com',
        'greenhouse.io', // Sometimes blocks
        'lever.co',
        'jobs.gem.com'
    ]

    const isUnembeddable = job.apply_url && UNEMBEDDABLE_DOMAINS.some(d => job.apply_url.includes(d))

    // Reset error when job changes
    if (!isOpen && iframeError) setIframeError(false)

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden sm:rounded-xl">
                {/* Header */}
                <div className="p-4 border-b border-border bg-card flex-shrink-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-xl font-bold text-foreground truncate">{job.title}</DialogTitle>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Building2 className="h-4 w-4" />
                                    {job.company}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {job.location || 'Remote'}
                                </span>
                                {job.salary && (
                                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                        <DollarSign className="h-4 w-4" />
                                        {job.salary}
                                    </span>
                                )}
                                {job.job_type && (
                                    <span className="flex items-center gap-1">
                                        <Briefcase className="h-4 w-4" />
                                        {job.job_type}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild className="gap-2 hidden sm:flex">
                                <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                    Open Externally
                                </a>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                <X className="h-5 w-5" />
                                <span className="sr-only">Close</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content - Iframe or Fallback */}
                <div className="flex-1 bg-white relative w-full h-full">
                    {!iframeError && !isUnembeddable ? (
                        <iframe
                            src={job.apply_url}
                            className="w-full h-full border-0"
                            title={`Apply to ${job.title}`}
                            onError={() => setIframeError(true)}
                            // Sandbox to prevent frame-busting but allow forms/scripts
                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
                            <div className="p-4 rounded-full bg-muted">
                                <ExternalLink className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Unable to embed application page</h3>
                                <p className="text-muted-foreground max-w-sm mt-2">
                                    This company's website prevents embedding. You'll need to open it in a new tab to apply.
                                </p>
                            </div>
                            <Button asChild>
                                <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                                    Open Application Page
                                </a>
                            </Button>
                        </div>
                    )}

                    {/* Floating Fallback for mobile or if iframe works but is cramped */}
                    <div className="absolute bottom-6 right-6 sm:hidden pointer-events-none">
                        <Button asChild className="pointer-events-auto shadow-lg">
                            <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                                Open Externally
                            </a>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
