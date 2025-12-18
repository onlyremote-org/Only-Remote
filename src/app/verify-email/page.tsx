import Link from 'next/link'

export default function VerifyEmailPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
            <div className="w-full max-w-md space-y-8 text-center">
                <div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                        Check your email
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        We sent you a verification link. Please check your email to verify your account and continue the onboarding process.
                    </p>
                </div>
                <div className="mt-8">
                    <Link
                        href="/login"
                        className="font-medium text-primary hover:text-primary/90 transition-colors"
                    >
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    )
}
