'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { forgotPassword } from '../auth/actions'

export const maxDuration = 60;

const initialState = {
    error: '',
    message: '',
}

export default function ForgotPasswordPage() {
    const [state, formAction, isPending] = useActionState(forgotPassword, initialState)

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
                        Reset your password
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        Or{' '}
                        <Link href="/login" className="font-medium text-primary hover:text-primary/90 transition-colors">
                            return to sign in
                        </Link>
                    </p>
                </div>
                <div className="mt-8 bg-card py-8 px-4 shadow-2xl ring-1 ring-white/10 sm:rounded-xl sm:px-10 border border-white/5">
                    <form action={formAction} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-foreground">
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-foreground shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {state?.error && (
                            <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500 text-center border border-red-500/20">
                                {state.error}
                            </div>
                        )}

                        {state?.message && (
                            <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-500 text-center border border-green-500/20">
                                {state.message}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isPending ? 'Sending link...' : 'Send reset link'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
