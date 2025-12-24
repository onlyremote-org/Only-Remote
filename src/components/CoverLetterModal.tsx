

import { useState, useEffect } from 'react'
import { Job } from '@/lib/jobs/types'
import { X, Copy, Download, Loader2, RefreshCw } from 'lucide-react'
import { jsPDF } from 'jspdf'

interface CoverLetterModalProps {
    isOpen: boolean
    onClose: () => void
    job: Job
    userName: string
}

export function CoverLetterModal({ isOpen, onClose, job, userName }: CoverLetterModalProps) {
    const [coverLetter, setCoverLetter] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            generateCoverLetter()
        }
    }, [isOpen])

    const generateCoverLetter = async () => {
        setIsLoading(true)
        setError('')
        try {
            const response = await fetch('/api/cover-letter/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobTitle: job.title,
                    companyName: job.company,
                    jobDescription: job.description_snippet,
                    userName: userName,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate')
            }

            setCoverLetter(data.coverLetter)
        } catch (err) {
            console.error(err)
            setError('Failed to generate cover letter. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(coverLetter)
        // Could add toast here
    }

    const handleDownload = () => {
        const doc = new jsPDF()

        // Header: Name
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(24)
        doc.text(userName || 'Your Name', 105, 20, { align: 'center' })

        // Horizontal Line
        doc.setLineWidth(0.5)
        doc.line(20, 28, 190, 28)

        // Body
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(11)

        const splitText = doc.splitTextToSize(coverLetter, 170)
        doc.text(splitText, 20, 40)

        doc.save(`Cover_Letter_${job.company.replace(/\s+/g, '_')}.pdf`)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-card border border-white/10 rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Cover Letter Generator</h2>
                        <p className="text-sm text-muted-foreground">For {job.title} at {job.company}</p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Drafting your cover letter...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
                            <p className="text-red-400">{error}</p>
                            <button
                                onClick={generateCoverLetter}
                                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                            >
                                <RefreshCw className="h-4 w-4" /> Try Again
                            </button>
                        </div>
                    ) : (
                        <textarea
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            className="w-full h-96 bg-background/50 border border-white/10 rounded-lg p-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-serif leading-relaxed"
                            placeholder="Your cover letter will appear here..."
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-card">
                    <button
                        onClick={handleCopy}
                        disabled={isLoading || !coverLetter}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 text-foreground rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                        <Copy className="h-4 w-4" /> Copy
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={isLoading || !coverLetter}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        <Download className="h-4 w-4" /> Download PDF
                    </button>
                </div>
            </div>
        </div>
    )
}
