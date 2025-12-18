'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { completeOnboarding } from './actions'
import { Check, Upload, ArrowRight, Loader2 } from 'lucide-react'

const JOB_PREFERENCES = [
    'Frontend Developer',
    'Backend Developer',
    'Customer Support',
    'Marketing',
    'Business Analyst',
    'Sales',
    'Human Resources',
    'Project Manager',
    'Finance',
    'Legal',
    'Operations',
    'Content Writing',
]

export default function OnboardingPage() {
    const [step, setStep] = useState(1)
    const [selectedPreferences, setSelectedPreferences] = useState<string[]>([])
    const [customPreference, setCustomPreference] = useState('')
    const [scanResult, setScanResult] = useState<any>(null)
    const [isScanning, setIsScanning] = useState(false)
    const [fileName, setFileName] = useState('')
    const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('free')
    const [resumeFile, setResumeFile] = useState<File | null>(null)
    const [scanError, setScanError] = useState<string>('')

    // Form state for final submission
    const [state, formAction, isPending] = useActionState(completeOnboarding, { error: '' })

    const handlePreferenceToggle = (pref: string) => {
        setSelectedPreferences(prev =>
            prev.includes(pref)
                ? prev.filter(p => p !== pref)
                : [...prev, pref]
        )
    }

    const addCustomPreference = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            if (customPreference.trim() && !selectedPreferences.includes(customPreference.trim())) {
                setSelectedPreferences([...selectedPreferences, customPreference.trim()])
                setCustomPreference('')
            }
        }
    }

    const removePreference = (pref: string) => {
        setSelectedPreferences(prev => prev.filter(p => p !== pref))
    }

    const handleResumeScan = async () => {
        if (!resumeFile) return

        setIsScanning(true)
        setScanError('')
        setScanResult(null) // Reset result

        const formData = new FormData()
        formData.append('file', resumeFile)

        try {
            const response = await fetch('/api/resume/analyze', {
                method: 'POST',
                body: formData,
            })

            const text = await response.text()

            // Handle HTTP Errors
            if (!response.ok) {
                console.error('Scan failed with status:', response.status, text)

                if (response.status === 413) {
                    throw new Error('File is too large for the server.')
                }
                if (response.status === 504) {
                    throw new Error('Analysis timed out. Please try a smaller file.')
                }

                // Try to parse error as JSON
                try {
                    const json = JSON.parse(text)
                    throw new Error(json.error?.message || `Server Error (${response.status})`)
                } catch (e) {
                    // If parsing failed, use the status text or raw text if short
                    throw new Error(`Server Error (${response.status})`)
                }
            }

            // Handle Success
            if (!text) {
                throw new Error('Empty response from server')
            }

            try {
                const result = await JSON.parse(text)
                if (result.success) {
                    setScanResult(result.data)
                } else {
                    throw new Error(result.error?.message || 'Unknown error occurred')
                }
            } catch (e) {
                throw new Error('Invalid response from server')
            }

        } catch (error) {
            console.error('Scan failed:', error)
            setScanError(error instanceof Error ? error.message : 'Failed to scan resume')
        } finally {
            setIsScanning(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-2xl space-y-8">
                {/* Progress Steps */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center space-x-4">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                                    ${step >= s ? 'border-primary bg-primary text-primary-foreground' : 'border-muted text-muted-foreground'}`}>
                                    {step > s ? <Check className="w-4 h-4" /> : s}
                                </div>
                                {s < 3 && <div className={`w-12 h-0.5 mx-2 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-card border border-white/5 shadow-2xl rounded-xl p-8">
                    <form action={formAction}>
                        {/* Hidden inputs for multi-step data */}
                        <input type="hidden" name="preferences" value={JSON.stringify(selectedPreferences)} />
                        <input type="hidden" name="plan" value={selectedPlan} />

                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-foreground">Tell us about yourself</h2>
                                    <p className="text-muted-foreground mt-2">Help us personalize your experience</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="fullName" className="block text-sm font-medium text-foreground">Full Name</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            id="fullName"
                                            required
                                            className="mt-1 block w-full rounded-md border-0 bg-white/5 py-2 px-3 text-foreground shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-primary sm:text-sm"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="website" className="block text-sm font-medium text-foreground">Website / Portfolio</label>
                                        <input
                                            type="url"
                                            name="website"
                                            id="website"
                                            className="mt-1 block w-full rounded-md border-0 bg-white/5 py-2 px-3 text-foreground shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-primary sm:text-sm"
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Job Preferences</label>
                                        <p className="text-xs text-muted-foreground mb-3">
                                            Tip: Leave blank to see all jobs. Selecting preferences helps us recommend relevant roles.
                                        </p>
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            {JOB_PREFERENCES.map((pref) => (
                                                <div
                                                    key={pref}
                                                    onClick={() => handlePreferenceToggle(pref)}
                                                    className={`cursor-pointer rounded-lg border p-3 text-sm transition-all
                                                        ${selectedPreferences.includes(pref)
                                                            ? 'border-primary bg-primary/10 text-primary'
                                                            : 'border-white/10 hover:border-white/20 text-muted-foreground'
                                                        }`}
                                                >
                                                    {pref}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Custom Preference Input */}
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={customPreference}
                                                onChange={(e) => setCustomPreference(e.target.value)}
                                                onKeyDown={addCustomPreference}
                                                className="block w-full rounded-md border-0 bg-white/5 py-2 px-3 text-foreground shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-primary sm:text-sm"
                                                placeholder="Type other role and press Enter..."
                                            />
                                        </div>

                                        {/* Selected Custom Preferences */}
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {selectedPreferences.filter(p => !JOB_PREFERENCES.includes(p)).map(pref => (
                                                <span key={pref} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                                                    {pref}
                                                    <button
                                                        type="button"
                                                        onClick={() => removePreference(pref)}
                                                        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary/30 focus:outline-none"
                                                    >
                                                        &times;
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    Next Step <ArrowRight className="ml-2 w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-foreground">Quick Resume Scan</h2>
                                    <p className="text-muted-foreground mt-2">Optional: Get instant AI feedback on your resume</p>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:bg-white/5 transition-colors">
                                        <input
                                            type="file"
                                            id="resume-upload"
                                            className="hidden"
                                            accept=".pdf,.docx"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) {
                                                    // Validate size (4.5MB limit for Vercel)
                                                    if (file.size > 4.5 * 1024 * 1024) {
                                                        setResumeFile(null)
                                                        setFileName('')
                                                        setScanError('File is too large. Maximum size is 4.5MB.')
                                                        e.target.value = '' // Reset input
                                                        return
                                                    }

                                                    setResumeFile(file)
                                                    setFileName(file.name)
                                                    setScanResult(null)
                                                    setScanError('')
                                                }
                                            }}
                                        />
                                        <label htmlFor="resume-upload" className="cursor-pointer block w-full">
                                            <div className="flex flex-col items-center">
                                                <Upload className="w-10 h-10 text-muted-foreground mb-4" />
                                                <p className="text-sm font-medium text-foreground">Click to upload resume</p>
                                                <p className="text-xs text-muted-foreground mt-1">PDF or DOCX (Max 5MB)</p>
                                                {fileName && <p className="text-xs text-green-400 mt-2 font-medium">Selected: {fileName}</p>}
                                            </div>
                                        </label>
                                    </div>

                                    {/* Scan Button - Only show if file selected and not scanning */}
                                    {fileName && !scanResult && (
                                        <button
                                            type="button"
                                            onClick={handleResumeScan}
                                            disabled={isScanning}
                                            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isScanning ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Analyzing Resume...
                                                </>
                                            ) : (
                                                <>
                                                    Scan Resume <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {/* Error Message */}
                                    {scanError && (
                                        <div className="text-red-400 text-sm text-center bg-red-400/10 p-3 rounded border border-red-400/20 animate-in fade-in slide-in-from-top-2">
                                            Error: {scanError}
                                        </div>
                                    )}
                                </div>

                                {/* Results Section */}
                                {scanResult && (
                                    <div className="bg-white/5 rounded-lg p-6 border border-white/10 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-foreground">ATS Score</span>
                                            <span className={`text-xl font-bold ${scanResult.overall_score >= 80 ? 'text-green-400' : scanResult.overall_score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                {scanResult.overall_score}/100
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">{scanResult.executive_summary}</p>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                            <div className="bg-black/20 p-2 rounded">
                                                <div className="text-muted-foreground mb-1">Impact</div>
                                                <div className="font-bold text-foreground">{scanResult.sections.impact.score}</div>
                                            </div>
                                            <div className="bg-black/20 p-2 rounded">
                                                <div className="text-muted-foreground mb-1">Keywords</div>
                                                <div className="font-bold text-foreground">{scanResult.sections.terminology.score}</div>
                                            </div>
                                            <div className="bg-black/20 p-2 rounded">
                                                <div className="text-muted-foreground mb-1">Structure</div>
                                                <div className="font-bold text-foreground">{scanResult.sections.structure.score}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4 border-t border-white/5">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-2 px-4 border border-white/10 rounded-md text-sm font-medium text-foreground hover:bg-white/5"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep(3)}
                                        className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90"
                                    >
                                        {scanResult ? "Continue with Results" : "Skip / Next"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-foreground">Choose your plan</h2>
                                    <p className="text-muted-foreground mt-2">Start with a 7-day free trial on Pro</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div
                                        onClick={() => setSelectedPlan('free')}
                                        className={`cursor-pointer rounded-xl border p-6 transition-all ${selectedPlan === 'free'
                                            ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                            : 'border-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <h3 className="font-semibold text-foreground">Free</h3>
                                        <p className="text-2xl font-bold text-foreground mt-2">$0<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                                        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                                            <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-400" /> Limited job views</li>
                                            <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-400" /> Basic profile</li>
                                        </ul>
                                    </div>

                                    <div
                                        onClick={() => setSelectedPlan('pro')}
                                        className={`cursor-pointer rounded-xl border p-6 transition-all ${selectedPlan === 'pro'
                                            ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                            : 'border-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold text-foreground">Pro</h3>
                                            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">Recommended</span>
                                        </div>
                                        <p className="text-2xl font-bold text-foreground mt-2">$5.99<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                                        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                                            <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-400" /> Unlimited job views</li>
                                            <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-400" /> AI Resume Scanner</li>
                                            <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-400" /> Priority support</li>
                                        </ul>
                                    </div>
                                </div>

                                {state?.error && (
                                    <div className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded border border-red-500/20">
                                        {state.error}
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="flex-1 py-2 px-4 border border-white/10 rounded-md text-sm font-medium text-foreground hover:bg-white/5"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        {isPending ? 'Completing Setup...' : 'Complete Setup'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div >
            </div >
        </div >
    )
}
