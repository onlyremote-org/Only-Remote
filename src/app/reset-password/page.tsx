'use client'

import { useActionState, useState } from 'react'
import { updatePassword } from '../auth/actions'
import { Eye, EyeOff } from 'lucide-react'

export const maxDuration = 60;

const initialState = {
    error: '',
}

export default function ResetPasswordPage() {
    const [state, formAction, isPending] = useActionState(updatePassword, initialState)
    const [showPassword, setShowPassword] = useState(false)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [validationError, setValidationError] = useState('')

    const handleSubmit = (formData: FormData) => {
        if (password !== confirmPassword) {
            setValidationError('Passwords do not match')
            return
        }
        setValidationError('')
        formAction(formData)
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
                        Set new password
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        Please enter your new password below.
                    </p>
                </div>
                <div className="mt-8 bg-card py-8 px-4 shadow-2xl ring-1 ring-white/10 sm:rounded-xl sm:px-10 border border-white/5">
                    <form action={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-foreground">
                                New Password
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
                                Confirm New Password
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

                        {validationError && (
                            <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500 text-center border border-red-500/20">
                                {validationError}
                            </div>
                        )}

                        {state?.error && (
                            <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500 text-center border border-red-500/20">
                                {state.error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isPending ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
