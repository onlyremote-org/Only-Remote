'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getURL } from '@/lib/utils'

export async function login(_prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(_prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    // Validate inputs
    if (!email || !password || !fullName) {
        return { error: 'Please fill in all fields.', message: '' }
    }

    try {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
                emailRedirectTo: `${getURL()}auth/callback?next=/onboarding`,
            },
        })

        if (error) {
            console.error('Signup error object:', error)

            // Handle specific 504/Timeout errors from Supabase
            if (error.status === 504 || error.name === 'AuthRetryableFetchError') {
                return {
                    error: 'Connection timed out. Please check your email inbox (and spam) - the confirmation link may have been sent despite this error.',
                    message: ''
                }
            }

            const errorMessage = error.message && typeof error.message === 'string'
                ? error.message
                : 'Failed to create account. Please try again.'

            return { error: errorMessage, message: '' }
        }
    } catch (err: any) {
        console.error('Unexpected signup error:', err)

        // Handle generic timeout in catch block
        if (err?.status === 504 || err?.name === 'AuthRetryableFetchError') {
            return {
                error: 'Connection timed out. Please check your email inbox (and spam) - the confirmation link may have been sent despite this error.',
                message: ''
            }
        }

        return { error: 'An unexpected error occurred. Please try again.', message: '' }
    }

    revalidatePath('/', 'layout')
    // Redirect to verify-email page
    redirect('/verify-email')
}

export async function forgotPassword(_prevState: any, formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${getURL()}auth/callback?next=/reset-password`,
        })

        if (error) {
            console.error('Forgot password error:', error)
            // Handle 504/Timeout from Supabase
            if (error.status === 504 || error.name === 'AuthRetryableFetchError') {
                return {
                    error: 'Connection timed out. Please check your email inbox (and spam) - the reset link may have been sent despite this error.',
                    message: ''
                }
            }
            return { error: error.message, message: '' }
        }
    } catch (err: any) {
        // Handle generic timeout in catch block
        if (err?.status === 504 || err?.name === 'AuthRetryableFetchError') {
            return {
                error: 'Connection timed out. Please check your email inbox (and spam) - the reset link may have been sent despite this error.',
                message: ''
            }
        }
        return { error: 'An unexpected error occurred.', message: '' }
    }

    return { message: 'Check your email for a password reset link.', error: '' }
}

export async function updatePassword(_prevState: any, formData: FormData) {
    const supabase = await createClient()
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!password || !confirmPassword) {
        return { error: 'Password is required' }
    }

    if (password !== confirmPassword) {
        return { error: 'Passwords do not match' }
    }

    try {
        const { error } = await supabase.auth.updateUser({ password })

        if (error) {
            return { error: error.message }
        }
    } catch (error) {
        return { error: 'An unexpected error occurred' }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}

export async function signInWithGoogle() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${getURL()}auth/callback?next=/jobs`,
        },
    })

    if (error) {
        redirect('/login?error=Could not authenticate with Google')
    }

    if (data.url) {
        redirect(data.url)
    }
}

export async function signInWithLinkedIn() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
            redirectTo: `${getURL()}auth/callback?next=/jobs`,
        },
    })

    if (error) {
        redirect('/login?error=Could not authenticate with LinkedIn')
    }

    if (data.url) {
        redirect(data.url)
    }
}
