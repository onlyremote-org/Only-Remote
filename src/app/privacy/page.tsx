export default function PrivacyPage() {
    return (
        <div className="bg-background min-h-screen py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-8">Privacy Policy</h1>
                    <div className="prose prose-lg prose-slate dark:prose-invert">
                        <p className="text-muted-foreground mb-6">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>

                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Introduction</h2>
                        <p className="text-muted-foreground mb-4">
                            Welcome to Only Remote ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you understand how we handle your personal information. This Privacy Policy explains how we collect, use, and disclose your information when you use our website and services.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Information We Collect</h2>
                        <p className="text-muted-foreground mb-4">
                            We collect information you provide directly to us, such as when you create an account, update your profile, or contact us.
                        </p>
                        <h3 className="text-lg font-medium text-foreground mt-6 mb-2">Subscription & Payment Data</h3>
                        <p className="text-muted-foreground mb-4">
                            When you purchase a subscription, we collect payment‑related information (such as transaction IDs and billing details) from our payment provider so we can manage your account, verify your purchase, and provide access to premium features. Payment card details are processed and stored by our third‑party payment processor and are not stored in full on Only Remote’s servers.
                        </p>
                        <h3 className="text-lg font-medium text-foreground mt-6 mb-2">Google User Data</h3>
                        <p className="text-muted-foreground mb-4">
                            If you choose to sign in with Google, we collect the following information from your Google profile:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                            <li><strong>Email Address:</strong> To verify your identity and communicate with you.</li>
                            <li><strong>Name:</strong> To personalize your user experience.</li>
                            <li><strong>Profile Picture:</strong> To display on your profile.</li>
                        </ul>
                        <p className="text-muted-foreground mb-4">
                            We do not access your contacts, Google Drive files, or any other private data associated with your Google account.
                        </p>

                        <h3 className="text-lg font-medium text-foreground mt-6 mb-2">Third-Party Sources</h3>
                        <p className="text-muted-foreground mb-4">
                            We may obtain job listings and related data from publicly available sources and third‑party APIs. This information is used solely to display job opportunities to you and does not affect how your personal information is processed.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. How We Use Your Information</h2>
                        <p className="text-muted-foreground mb-4">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                            <li>Provide, maintain, and improve our services.</li>
                            <li>Process your registration and manage your account.</li>
                            <li>Send you technical notices, updates, security alerts, and support messages.</li>
                            <li>Respond to your comments, questions, and requests.</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Data Sharing and Disclosure</h2>
                        <p className="text-muted-foreground mb-4">
                            We do not share your personal information with third parties except as described in this policy (e.g., with service providers who assist us in operating our services) or with your consent. We do not sell your personal data.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Data Retention and Deletion</h2>
                        <p className="text-muted-foreground mb-4">
                            We retain your personal information for as long as necessary to provide our services. You may request the deletion of your account and associated data at any time by contacting us at <a href="mailto:support@onlyremote.org" className="text-primary hover:underline">support@onlyremote.org</a>.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Cookies</h2>
                        <p className="text-muted-foreground mb-4">
                            We use cookies to improve your experience, such as keeping you signed in. You can control cookies through your browser settings.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Contact Us</h2>
                        <p className="text-muted-foreground mb-4">
                            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@onlyremote.org" className="text-primary hover:underline">support@onlyremote.org</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
