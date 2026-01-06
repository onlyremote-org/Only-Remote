'use client'

import { useState } from 'react'

export default function ResumePage() {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState('')
    const [data, setData] = useState<any>(null)
    const [fileName, setFileName] = useState('')

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsPending(true)
        setError('')
        setData(null)

        const formData = new FormData(event.currentTarget)
        const file = formData.get('file') as File

        if (!file || file.size === 0) {
            setError('Please select a file.')
            setIsPending(false)
            return
        }

        try {
            const response = await fetch('/api/resume/analyze', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error?.message || 'Failed to analyze resume')
            }

            if (result.success) {
                setData(result.data)
            } else {
                setError(result.error?.message || 'Unknown error')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-foreground sm:truncate sm:text-3xl sm:tracking-tight">
                        Resume Scanner
                    </h2>
                </div>
            </div>

            <div className="bg-card shadow-xl ring-1 ring-white/10 sm:rounded-xl border border-white/5">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-base font-semibold leading-6 text-foreground">
                        Scan your resume
                    </h3>
                    <div className="mt-2 max-w-xl text-sm text-muted-foreground">
                        <p>
                            Upload your resume (PDF or DOCX) to get AI-powered feedback and job matching suggestions.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-5">
                        <div className="mb-4">
                            <label htmlFor="resume" className="block text-sm font-medium text-foreground">
                                Resume File
                            </label>
                            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-white/25 px-6 py-10 hover:bg-white/5 transition-colors">
                                <div className="text-center">
                                    <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"
                                        >
                                            <span>Upload a file</span>
                                            <input
                                                id="file-upload"
                                                name="file"
                                                type="file"
                                                accept=".pdf,.docx"
                                                className="sr-only"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) setFileName(file.name)
                                                }}
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs leading-5 text-muted-foreground">PDF or DOCX up to 5MB</p>
                                    {fileName && (
                                        <p className="mt-2 text-sm font-medium text-green-400">
                                            Selected: {fileName}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isPending ? 'Scanning...' : 'Scan Resume'}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 rounded-md bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
                            {error}
                        </div>
                    )}

                    {data && (
                        <div className="mt-8 border-t border-white/10 pt-8 space-y-8">
                            {/* Executive Summary */}
                            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                                    <h3 className="text-xl font-bold text-foreground">Executive Summary</h3>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-muted-foreground">Overall Score</span>
                                        <div className={`px-4 py-1 rounded-full font-bold text-lg ${data.overall_score >= 80 ? 'bg-green-500/20 text-green-400' :
                                            data.overall_score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                            }`}>
                                            {data.overall_score}/100
                                        </div>
                                    </div>
                                </div>
                                <p className="text-muted-foreground leading-relaxed break-words">
                                    {data.executive_summary}
                                </p>
                            </div>

                            {/* Detailed Sections */}
                            <div className="grid gap-6 lg:grid-cols-3">
                                {/* Impact Section */}
                                <div className="bg-white/5 rounded-xl p-6 border border-white/10 lg:col-span-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                                        <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                            Impact & Quantification
                                        </h4>
                                        <span className="font-mono text-sm text-muted-foreground">Score: {data.sections.impact.score}/100</span>
                                    </div>
                                    <div className="space-y-4">
                                        {data.sections.impact.issues.length === 0 ? (
                                            <p className="text-green-400 text-sm">No issues found. Great job quantifying your impact!</p>
                                        ) : (
                                            data.sections.impact.issues.map((issue: any, i: number) => (
                                                <div key={i} className="bg-black/20 rounded-lg p-4 border border-white/5">
                                                    <div className="mb-2">
                                                        <span className="text-xs font-medium text-red-400 uppercase tracking-wider">Issue</span>
                                                        <p className="text-sm text-foreground mt-1 break-words">{issue.issue}</p>
                                                    </div>
                                                    {issue.original_text && (
                                                        <div className="mb-3 pl-3 border-l-2 border-white/10">
                                                            <p className="text-xs text-muted-foreground italic break-words">"{issue.original_text}"</p>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Fix</span>
                                                        <p className="text-sm text-green-100 mt-1 break-words">{issue.improvement}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Terminology Section */}
                                <div className="bg-white/5 rounded-xl p-6 border border-white/10 lg:col-span-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                                        <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                                            Technical Terminology
                                        </h4>
                                        <span className="font-mono text-sm text-muted-foreground">Score: {data.sections.terminology.score}/100</span>
                                    </div>
                                    <div className="space-y-4">
                                        {data.sections.terminology.issues.length === 0 ? (
                                            <p className="text-green-400 text-sm">Excellent use of technical terminology.</p>
                                        ) : (
                                            data.sections.terminology.issues.map((issue: any, i: number) => (
                                                <div key={i} className="bg-black/20 rounded-lg p-4 border border-white/5">
                                                    <div className="flex flex-col sm:flex-row items-start gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-foreground font-medium break-words">{issue.issue}</p>
                                                            <p className="text-sm text-green-400 mt-1 break-words">Suggestion: {issue.improvement}</p>
                                                        </div>
                                                        {issue.original_text && (
                                                            <span className="text-xs bg-white/10 px-2 py-1 rounded text-muted-foreground break-words whitespace-normal max-w-full sm:max-w-[40%]">
                                                                {issue.original_text}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Structure Section */}
                                <div className="bg-white/5 rounded-xl p-6 border border-white/10 lg:col-span-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                                        <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                                            ATS Structure
                                        </h4>
                                        <span className="font-mono text-sm text-muted-foreground">Score: {data.sections.structure.score}/100</span>
                                    </div>
                                    <div className="space-y-4">
                                        {data.sections.structure.issues.length === 0 ? (
                                            <p className="text-green-400 text-sm">Structure looks perfect for ATS parsing.</p>
                                        ) : (
                                            data.sections.structure.issues.map((issue: any, i: number) => (
                                                <div key={i} className="bg-black/20 rounded-lg p-4 border border-white/5">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <span className="text-xs font-bold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">
                                                            {issue.location_hint || 'General'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-foreground break-words">{issue.issue}</p>
                                                    <p className="text-sm text-muted-foreground mt-1 break-words">{issue.improvement}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Global Recommendations */}
                            <div className="bg-gradient-to-r from-primary/10 to-transparent rounded-xl p-6 border border-primary/20">
                                <h4 className="text-lg font-semibold text-foreground mb-4">Top Recommendations</h4>
                                <ul className="space-y-2">
                                    {data.global_recommendations?.map((rec: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
