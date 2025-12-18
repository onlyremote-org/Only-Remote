import Image from 'next/image'

export default function AboutPage() {
    return (
        <div className="bg-background min-h-screen py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center mb-16">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-6">
                        About Only Remote
                    </h1>
                    <p className="text-lg leading-8 text-muted-foreground">
                        We are on a mission to democratize access to global opportunities.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-6">Our Mission</h2>
                        <p className="text-lg text-muted-foreground mb-6">
                            Only Remote was built with a simple belief: talent is everywhere, but opportunity is not. We bridge that gap by curating the best remote jobs from around the world and making them accessible to everyone.
                        </p>
                        <p className="text-lg text-muted-foreground">
                            Whether you're a developer in Brazil, a designer in Japan, or a marketer in the US, we believe you should have access to high-quality work that fits your lifestyle.
                        </p>
                    </div>
                    <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden bg-secondary/50 border border-border flex items-center justify-center">
                        <Image
                            src="/logo-v2.png"
                            alt="Only Remote Mission"
                            width={200}
                            height={200}
                            className="object-contain opacity-50"
                        />
                    </div>
                </div>

                <div className="mx-auto max-w-3xl">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground mb-8 text-center">Why Choose Us?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                            <h3 className="text-xl font-semibold text-foreground mb-3">Curated Listings</h3>
                            <p className="text-muted-foreground">
                                We don't just scrape everything. We verify listings to ensure they are truly remote and from reputable companies.
                            </p>
                        </div>
                        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                            <h3 className="text-xl font-semibold text-foreground mb-3">AI-Powered Tools</h3>
                            <p className="text-muted-foreground">
                                Our AI resume scanner helps you tailor your application to specific roles, increasing your chances of getting hired.
                            </p>
                        </div>
                        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                            <h3 className="text-xl font-semibold text-foreground mb-3">Global Focus</h3>
                            <p className="text-muted-foreground">
                                We specifically highlight jobs that are open to candidates worldwide, not just those in specific time zones.
                            </p>
                        </div>
                        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                            <h3 className="text-xl font-semibold text-foreground mb-3">Community First</h3>
                            <p className="text-muted-foreground">
                                We are building a community of remote workers who support each other in navigating the future of work.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
