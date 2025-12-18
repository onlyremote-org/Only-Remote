export default function TermsPage() {
    return (
        <div className="bg-background min-h-screen py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-8">Terms of Service</h1>
                    <div className="prose prose-lg prose-slate dark:prose-invert">
                        <p className="text-muted-foreground mb-6">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>

                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Agreement to Terms</h2>
                        <p className="text-muted-foreground mb-4">
                            By accessing or using Only Remote, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Description of Service</h2>
                        <p className="text-muted-foreground mb-4">
                            Only Remote provides a platform for users to find remote job listings and tools to assist in their job search. We do not guarantee employment or the accuracy of job listings provided by third parties.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. User Accounts</h2>
                        <p className="text-muted-foreground mb-4">
                            To access certain features, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Acceptable Use</h2>
                        <p className="text-muted-foreground mb-4">
                            You agree not to use the service for any unlawful purpose or in any way that interrupts, damages, or impairs the service. You may not scrape, harvest, or collect data from our website without our express written consent.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Subscription and Payments</h2>
                        <p className="text-muted-foreground mb-4">
                            Some features may require a paid subscription. By subscribing, you agree to pay the applicable fees. We reserve the right to change our pricing at any time.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Termination</h2>
                        <p className="text-muted-foreground mb-4">
                            We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other reason.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Limitation of Liability</h2>
                        <p className="text-muted-foreground mb-4">
                            In no event shall Only Remote be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Changes to Terms</h2>
                        <p className="text-muted-foreground mb-4">
                            We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new Terms of Service on this page.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">9. Contact Us</h2>
                        <p className="text-muted-foreground mb-4">
                            If you have any questions about these Terms, please contact us at <a href="mailto:support@onlyremote.org" className="text-primary hover:underline">support@onlyremote.org</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
