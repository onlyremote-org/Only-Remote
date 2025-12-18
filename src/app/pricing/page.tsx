import Link from 'next/link'
import { Check } from 'lucide-react'

const tiers = [
    {
        name: 'Free',
        id: 'tier-free',
        href: '/signup',
        priceMonthly: '$0',
        description: 'The essentials to find your next remote role.',
        features: [
            'Access to all remote jobs',
            'H1B Visa sponsorship filtering',
            'Limited AI Resume Scans',
            'Limited AI Cover Letters',
        ],
        mostPopular: false,
    },
    {
        name: 'Pro',
        id: 'tier-pro',
        href: '/signup?plan=pro',
        priceMonthly: '$5.99',
        description: 'Unlock the full power of AI for your job search.',
        features: [
            'Everything in Free',
            'Unlimited AI Resume Scans',
            'Unlimited AI Cover Letters',
            'AI Job Matching Scores',
            'Priority Support',
        ],
        mostPopular: true,
    },
]

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default function PricingPage() {
    return (
        <div className="bg-background py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary">Pricing</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Invest in your remote career
                    </p>
                </div>
                <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-muted-foreground">
                    Choose the plan that fits your job search needs. Cancel anytime.
                </p>
                <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-x-8 xl:gap-x-12">
                    {tiers.map((tier) => (
                        <div
                            key={tier.id}
                            className={classNames(
                                tier.mostPopular ? 'ring-2 ring-primary' : 'ring-1 ring-white/10',
                                'rounded-3xl p-8 xl:p-10 bg-card'
                            )}
                        >
                            <div className="flex items-center justify-between gap-x-4">
                                <h3
                                    id={tier.id}
                                    className={classNames(
                                        tier.mostPopular ? 'text-primary' : 'text-foreground',
                                        'text-lg font-semibold leading-8'
                                    )}
                                >
                                    {tier.name}
                                </h3>
                                {tier.mostPopular ? (
                                    <p className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold leading-5 text-primary">
                                        Most popular
                                    </p>
                                ) : null}
                            </div>
                            <p className="mt-4 text-sm leading-6 text-muted-foreground">{tier.description}</p>
                            <p className="mt-6 flex items-baseline gap-x-1">
                                <span className="text-4xl font-bold tracking-tight text-foreground">{tier.priceMonthly}</span>
                                <span className="text-sm font-semibold leading-6 text-muted-foreground">/month</span>
                            </p>
                            <Link
                                href={tier.href}
                                aria-describedby={tier.id}
                                className={classNames(
                                    tier.mostPopular
                                        ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                                        : 'bg-white/10 text-white hover:bg-white/20',
                                    'mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                                )}
                            >
                                {tier.name === 'Free' ? 'Get started' : 'Subscribe'}
                            </Link>
                            <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex gap-x-3">
                                        <Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
