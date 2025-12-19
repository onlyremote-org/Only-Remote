'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { signup, signInWithGoogle, signInWithLinkedIn } from '../auth/actions'
import { Eye, EyeOff } from 'lucide-react'

export const maxDuration = 60;

const initialState = {
    error: '',
    message: '',
}

export default function SignupPage() {
    const [state, formAction, isPending] = useActionState(signup, initialState)
    const [showPassword, setShowPassword] = useState(false)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')

    const handleSubmit = (formData: FormData) => {
        if (password !== confirmPassword) {
            setPasswordError('Passwords do not match')
            return
        }
        setPasswordError('')
        formAction(formData)
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        Or{' '}
                        <Link href="/login" className="font-medium text-primary hover:text-primary/90 transition-colors">
                            sign in to existing account
                        </Link>
                    </p>
                </div>
                <div className="mt-8 bg-card py-8 px-4 shadow-2xl ring-1 ring-white/10 sm:rounded-xl sm:px-10 border border-white/5">
                    <form action={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="full-name" className="block text-sm font-medium leading-6 text-foreground">
                                    Full Name
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="full-name"
                                        name="fullName"
                                        type="text"
                                        autoComplete="name"
                                        required
                                        className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-foreground shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

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

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-foreground">
                                    Password
                                </label>
                                <div className="mt-2 relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-foreground shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 pr-10"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                                        ) : (
                                            <Eye className="h-4 w-4" aria-hidden="true" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium leading-6 text-foreground">
                                    Confirm Password
                                </label>
                                <div className="mt-2 relative">
                                    <input
                                        id="confirm-password"
                                        name="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-foreground shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 pr-10"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        {passwordError && (
                            <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500 text-center border border-red-500/20">
                                {passwordError}
                            </div>
                        )}

                        {state?.error && typeof state.error === 'string' && (
                            <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500 text-center border border-red-500/20">
                                {state.error}
                            </div>
                        )}

                        {/* Debug: Handle non-string errors to see what they are */}
                        {state?.error && typeof state.error !== 'string' && (
                            <div className="rounded-md bg-yellow-500/10 p-3 text-xs text-yellow-500 text-center border border-yellow-500/20">
                                Debug Error format: {JSON.stringify(state.error)}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isPending ? 'Creating account...' : 'Sign up'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <button
                                onClick={() => signInWithGoogle()}
                                className="flex w-full items-center justify-center gap-3 rounded-md bg-white/5 px-3 py-2 text-sm font-semibold text-foreground shadow-sm ring-1 ring-inset ring-white/10 hover:bg-white/10 focus-visible:ring-transparent"
                            >
                                <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                                    <path
                                        d="M12.0003 20.45c4.6667 0 8.45-3.7833 8.45-8.45 0-.65-.0667-1.2833-.1834-1.9H12.0003v3.6h4.8334c-.2167 1.1333-1.2334 3.25-4.8334 3.25-2.9167 0-5.2834-2.3667-5.2834-5.2834s2.3667-5.2833 5.2834-5.2833c1.2833 0 2.4333.4667 3.3333 1.3167l2.55-2.55C16.3169 3.5667 14.3169 2.7333 12.0003 2.7333 6.8836 2.7333 2.7336 6.8833 2.7336 12c0 5.1167 4.15 9.2667 9.2667 9.2667z"
                                        fill="currentColor"
                                    />
                                </svg>
                                <span className="text-sm font-semibold leading-6">Continue with Google</span>
                            </button>

                            <button
                                onClick={() => signInWithLinkedIn()}
                                className="flex w-full items-center justify-center gap-3 rounded-md bg-[#0077b5] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0077b5]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0077b5]"
                            >
                                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                                <span className="text-sm font-semibold leading-6">Continue with LinkedIn</span>
                            </button>
                        </div>
                    </div>
                </div>
                <p className="text-center text-xs text-muted-foreground/30 mt-8">
                    Secure Sign Up • v2.0
                </p>
            </div>
        </div>
    )
}
