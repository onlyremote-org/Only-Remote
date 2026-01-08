'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Job } from '@/lib/jobs/types'
import { ExternalLink, X, Building2, MapPin, DollarSign, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { checkFrameHeaders } from '@/app/actions/check-frame'

interface JobDetailModalProps {
    isOpen: boolean
    onClose: () => void
    job: Job
}

export function JobDetailModal({ isOpen, onClose, job }: JobDetailModalProps) {
    const [iframeError, setIframeError] = useState(false)
    const [canEmbed, setCanEmbed] = useState<boolean | null>(null) // null = loading

    // Fast-fail list for known blockers to skip network check
    const KNOWN_BLOCKERS = [
        'workday.com',
        'myworkdayjobs.com',
        'riotgames.com',
        'ascension.org',
        'join.com',
        'recruitee.com',
    ]

    useEffect(() => {
        if (!isOpen || !job.apply_url) return

        let mounted = true
        setIframeError(false)

        // 1. Check fast-fail list
        if (KNOWN_BLOCKERS.some(d => job.apply_url?.includes(d))) {
            setCanEmbed(false)
            return
        }

        // 2. Perform server check
        setCanEmbed(null) // Start loading
        checkFrameHeaders(job.apply_url)
            .then(result => {
                if (mounted) {
                    setCanEmbed(result.canEmbed)
                }
            })
            .catch(() => {
                if (mounted) setCanEmbed(false) // Fallback on error
            })

        return () => { mounted = false }
    }, [isOpen, job.apply_url]) // Re-run when modal opens or url changes

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
                    {/* Loading State */}
                    {canEmbed === null && (
                        <div className="absolute inset-0 flex items-center justify-center bg-card z-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    )}

                    {/* Valid State */}
                    {canEmbed === true && !iframeError ? (
                        <iframe
                            src={job.apply_url}
                            className="w-full h-full border-0"
                            title={`Apply to ${job.title}`}
                            onError={() => setIframeError(true)}
                            // Sandbox to prevent frame-busting but allow forms/scripts
                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                        />
                    ) : (
                        // Fallback UI (renders if canEmbed is strictly false OR iframeError occurred)
                        (canEmbed === false || iframeError) && (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-4 rounded-full bg-muted">
                                    <ExternalLink className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">
                                        {canEmbed === false ? "Open in New Tab" : "Unable to load preview"}
                                    </h3>
                                    <p className="text-muted-foreground max-w-sm mt-2">
                                        {canEmbed === false
                                            ? "This application page cannot be displayed directly here due to the company's security settings."
                                            : "The connection to this site was refused. Please open it directly."}
                                    </p>
                                </div>
                                <Button size="lg" asChild className="mt-4">
                                    <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                                        Apply on Company Site
                                    </a>
                                </Button>
                            </div>
                        )
                    )}

                    {/* Floating Fallback key for mobile */}
                    <div className="absolute bottom-6 right-6 sm:hidden pointer-events-none z-20">
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
