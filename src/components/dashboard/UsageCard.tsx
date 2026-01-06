import Link from 'next/link'
import { MAX_FREE_SCANS, MAX_FREE_COVER_LETTERS } from '@/lib/limits'

interface UsageCardProps {
    isPro: boolean
    resumeCount: number
    coverLetterCount: number
}

export function UsageCard({ isPro, resumeCount, coverLetterCount }: UsageCardProps) {
    if (isPro) {
        return (
            <div className="rounded-xl border border-white/5 bg-white/5 p-6 shadow-2xl ring-1 ring-white/10">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold leading-7 text-foreground">Usage Limits</h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            You are on the <span className="text-primary font-medium">Pro Plan</span>.
                        </p>
                    </div>
                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                        Unlimited Access
                    </span>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-lg bg-black/20 p-4">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">Resume Scans</span>
                            <span className="text-xs text-primary font-mono">UNLIMITED</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/10">
                            <div className="h-2 rounded-full bg-primary w-full" />
                        </div>
                    </div>
                    <div className="rounded-lg bg-black/20 p-4">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">Cover Letters</span>
                            <span className="text-xs text-primary font-mono">UNLIMITED</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/10">
                            <div className="h-2 rounded-full bg-primary w-full" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const resumePercent = Math.min((resumeCount / MAX_FREE_SCANS) * 100, 100)
    const coverLetterPercent = Math.min((coverLetterCount / MAX_FREE_COVER_LETTERS) * 100, 100)
    const isLimitReached = resumeCount >= MAX_FREE_SCANS || coverLetterCount >= MAX_FREE_COVER_LETTERS

    return (
        <div className="rounded-xl border border-white/5 bg-white/5 p-6 shadow-2xl ring-1 ring-white/10">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold leading-7 text-foreground">Free Plan Usage</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Resets every 30 days.
                    </p>
                </div>
                {isLimitReached && (
                    <Link
                        href="/dashboard/subscription"
                        className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                        Upgrade to Pro
                    </Link>
                )}
            </div>

            <div className="mt-6 space-y-4">
                {/* Resume Scans */}
                <div>
                    <div className="flex justify-between mb-2 text-sm">
                        <span className="font-medium text-foreground">Resume Scans</span>
                        <span className="text-muted-foreground">{resumeCount} / {MAX_FREE_SCANS}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10">
                        <div
                            className={`h-2 rounded-full transition-all duration-500 ${resumeCount >= MAX_FREE_SCANS ? 'bg-red-500' : 'bg-primary'}`}
                            style={{ width: `${resumePercent}%` }}
                        />
                    </div>
                </div>

                {/* Cover Letters */}
                <div>
                    <div className="flex justify-between mb-2 text-sm">
                        <span className="font-medium text-foreground">Cover Letters</span>
                        <span className="text-muted-foreground">{coverLetterCount} / {MAX_FREE_COVER_LETTERS}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10">
                        <div
                            className={`h-2 rounded-full transition-all duration-500 ${coverLetterCount >= MAX_FREE_COVER_LETTERS ? 'bg-red-500' : 'bg-primary'}`}
                            style={{ width: `${coverLetterPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
                <p className="text-xs text-muted-foreground text-center">
                    Want more? <Link href="/dashboard/subscription" className="text-primary hover:underline">Upgrade to Pro</Link> for unlimited access.
                </p>
            </div>
        </div>
    )
}
