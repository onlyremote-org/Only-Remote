'use client'

import { useState } from 'react'
import { Job } from '@/lib/jobs/types'
import { JobCard } from './job-card'
import { CoverLetterModal } from '@/components/CoverLetterModal'
import { PaginationControls } from '@/components/pagination-controls'

interface JobsListProps {
    jobs: Job[]
    savedJobIds: Set<string>
    userName: string
    resumeSkills: string[]
    page: number
    totalPages: number
}

export function JobsList({ jobs, savedJobIds, userName, resumeSkills, page, totalPages }: JobsListProps) {
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleGenerateCoverLetter = (job: Job) => {
        setSelectedJob(job)
        setIsModalOpen(true)
    }

    const calculateMatchScore = (job: Job) => {
        if (resumeSkills.length === 0) return null

        let matches = 0
        const jobText = (job.title + ' ' + job.tags.join(' ') + ' ' + (job.job_type || '')).toLowerCase()

        resumeSkills.forEach(skill => {
            if (jobText.includes(skill)) matches++
        })

        const score = Math.min(100, Math.round((matches / Math.max(1, Math.min(resumeSkills.length, 10))) * 100))
        return score
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                    <JobCard
                        key={job.id}
                        job={job}
                        isSaved={savedJobIds.has(job.id)}
                        userName={userName}
                        matchScore={calculateMatchScore(job)}
                        onGenerateCoverLetter={handleGenerateCoverLetter}
                    />
                ))}
            </div>

            <PaginationControls
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/jobs"
            />

            {selectedJob && (
                <CoverLetterModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    job={selectedJob}
                    userName={userName}
                />
            )}
        </>
    )
}
