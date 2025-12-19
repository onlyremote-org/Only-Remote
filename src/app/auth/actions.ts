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

    // DEBUG TRAP: Verify we can reach this code
    if (email.includes('debug')) {
        return { error: 'DEBUG TRAP ACTIVE - SERVER IS REACHABLE', message: '' }
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
            // CRITICAL DEBUG: Dump the entire object to see why it behaves like "{}"
            const rawError = JSON.stringify(error, null, 2)
            return { error: `SUPABASE ERROR RAW: ${rawError}`, message: '' }
        }
    } catch (err) {
        console.error('Unexpected signup error:', err)
        const rawErr = JSON.stringify(err, null, 2)
        return { error: `CATCH ERROR RAW: ${rawErr}`, message: '' }
    }

    revalidatePath('/', 'layout')
    // Redirect to verify-email page
    redirect('/verify-email')
}

export async function forgotPassword(_prevState: any, formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getURL()}auth/callback?next=/reset-password`,
    })

    if (error) {
        return { error: error.message }
    }

    return { message: 'Check your email for a password reset link.' }
}

export async function updatePassword(_prevState: any, formData: FormData) {
    const supabase = await createClient()
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
        return { error: 'Passwords do not match' }
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
        return { error: error.message }
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
