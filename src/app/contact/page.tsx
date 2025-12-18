export default function ContactPage() {
    return (
        <div className="bg-background min-h-screen py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">Contact Us</h1>
                    <p className="mt-4 text-lg leading-8 text-muted-foreground">
                        Have questions, feedback, or need support? We're here to help.
                    </p>

                    <div className="mt-12 bg-card p-8 rounded-2xl border border-border shadow-sm">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Get in Touch</h2>
                        <p className="text-muted-foreground mb-6">
                            The best way to reach us is via email. We typically respond within 24-48 hours.
                        </p>
                        <a
                            href="mailto:support@onlyremote.org"
                            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                        >
                            Email Support
                        </a>
                        <p className="mt-6 text-sm text-muted-foreground">
                            support@onlyremote.org
                        </p>
                    </div>

                    <div className="mt-12">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Mailing Address</h3>
                        <p className="text-muted-foreground">
                            Only Remote, Inc.<br />
                            123 Remote Way<br />
                            Cloud City, Internet 99999
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
