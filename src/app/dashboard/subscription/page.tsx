import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckIcon } from 'lucide-react'

const tiers = [
    {
        name: 'Free',
        id: 'free',
        priceMonthly: '$0',
        description: 'The essentials to find your next remote role.',
        features: [
            'Access to all remote jobs',
            'H1B Visa sponsorship filtering',
            'Limited AI Resume Scans',
            'Limited AI Cover Letters',
        ],
    },
    {
        name: 'Pro',
        id: 'pro',
        priceMonthly: '$5.99',
        description: 'Unlock the full power of AI for your job search.',
        features: [
            'Everything in Free',
            'Unlimited AI Resume Scans',
            'Unlimited AI Cover Letters',
            'AI Job Matching Scores',
            'Priority Support',
        ],
    },
]

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default async function SubscriptionPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const isPro = profile?.is_premium === true

    // Import actions dynamically or just assume they are available since we are in RSC
    // We need to import them at the top really, but let's assume I add imports later? 
    // Wait, replace_file_content doesn't let me add imports easily if I'm targeting this block.
    // I should probably do a multi-replace or just one big replace.
    // Let's do a replace of the logical block first.

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-foreground sm:truncate sm:text-3xl sm:tracking-tight">
                        Subscription Management
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your plan and billing details.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {tiers.map((tier) => {
                    const isCurrent = (tier.id === 'free' && !isPro) || (tier.id === 'pro' && isPro)
                    return (
                        <div
                            key={tier.id}
                            className={classNames(
                                isCurrent ? 'ring-2 ring-primary bg-card' : 'ring-1 ring-border bg-card/50',
                                'rounded-3xl p-8 xl:p-10 relative flex flex-col justify-between'
                            )}
                        >
                            <div>
                                <div className="flex items-center justify-between gap-x-4">
                                    <h3
                                        id={tier.id}
                                        className={classNames(
                                            isCurrent ? 'text-primary' : 'text-foreground',
                                            'text-lg font-semibold leading-8'
                                        )}
                                    >
                                        {tier.name}
                                    </h3>
                                    {isCurrent ? (
                                        <p className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold leading-5 text-primary">
                                            Current Plan
                                        </p>
                                    ) : null}
                                </div>
                                <p className="mt-4 text-sm leading-6 text-muted-foreground">{tier.description}</p>
                                <p className="mt-6 flex items-baseline gap-x-1">
                                    <span className="text-4xl font-bold tracking-tight text-foreground">{tier.priceMonthly}</span>
                                    <span className="text-sm font-semibold leading-6 text-muted-foreground">/month</span>
                                </p>
                                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex gap-x-3">
                                            <CheckIcon className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-8">
                                {isCurrent ? (
                                    <button
                                        type="button"
                                        disabled
                                        className="block w-full rounded-md bg-muted px-3 py-2 text-center text-sm font-semibold text-muted-foreground shadow-sm cursor-not-allowed"
                                    >
                                        Active
                                    </button>
                                ) : (
                                    <form action={async () => {
                                        'use server'
                                        const { createPremiumCheckout, createPortalSession } = await import('@/app/actions/payment')
                                        if (tier.id === 'pro') {
                                            await createPremiumCheckout('/dashboard/subscription')
                                        } else {
                                            await createPortalSession()
                                        }
                                    }}>
                                        <button
                                            type="submit"
                                            className={classNames(
                                                tier.id === 'pro'
                                                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                                    : 'bg-card text-primary ring-1 ring-inset ring-primary/20 hover:ring-primary/30',
                                                'block w-full rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                                            )}
                                        >
                                            {tier.id === 'pro' ? 'Upgrade to Pro' : 'Manage Subscription'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
