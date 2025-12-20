'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function AuthCodeErrorPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-background">
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
                Authentication Error
            </h1>
            <p className="mt-2 text-base text-muted-foreground max-w-md">
                We couldn't verify your sign-in link. This often happens if the link has expired or has already been used.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
                If you already verified your email, try signing in directly.
            </p>
            <div className="mt-8">
                <Link
                    href="/login"
                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                >
                    Return to Log in
                </Link>
            </div>
        </div>
    )
}
