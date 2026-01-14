import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/jobs'

    if (code) {
        const supabase = await createClient()
        // Use 'let' so we can suppress the error if needed
        let { error } = await supabase.auth.exchangeCodeForSession(code)

        // If error, check if we are already logged in (Double Request Bug fix)
        if (error) {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                error = null // Suppress error, we are good
            }
        }

        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'

            // Determine the base URL for redirects
            let baseUrl = origin
            if (!isLocalEnv && forwardedHost) {
                baseUrl = `https://${forwardedHost}`
            } else if (process.env.NEXT_PUBLIC_APP_URL) {
                baseUrl = process.env.NEXT_PUBLIC_APP_URL
            }

            // Check if user has a profile
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('onboarding_completed')
                    .eq('id', user.id)
                    .single()

                if (!profile) {
                    // Create profile for new user
                    const { user_metadata } = user
                    const fullName = user_metadata.full_name || user_metadata.name || ''
                    const firstName = user_metadata.given_name || user_metadata.first_name || fullName.split(' ')[0] || ''
                    const lastName = user_metadata.family_name || user_metadata.last_name || fullName.split(' ').slice(1).join(' ') || ''

                    await supabase.from('profiles').insert({
                        id: user.id,
                        email: user.email,
                        first_name: firstName,
                        last_name: lastName,
                        plan: 'free',
                        onboarding_completed: false,
                    })

                    // Optimization: Sync to Auth Metadata
                    await supabase.auth.updateUser({
                        data: { onboarding_completed: false }
                    })

                    // Send Welcome Email
                    try {
                        const { sendWelcomeEmail } = await import('@/lib/email/events')
                        await sendWelcomeEmail(user.email!, firstName)
                    } catch (e) {
                        console.error('Failed to send welcome email:', e)
                    }

                    // Redirect to onboarding for new users
                    return NextResponse.redirect(`${baseUrl}/onboarding`)
                } else if (!profile.onboarding_completed) {
                    // Redirect to onboarding if incomplete
                    return NextResponse.redirect(`${baseUrl}/onboarding`)
                }
            }

            return NextResponse.redirect(`${baseUrl}${next}`)
        }
    }

    // "Soft Redirect" (Fail Open)
    // Even if the code exchange failed (e.g. consumed by email scanner),
    // we redirect the user to the app. 
    // - If they have a session cookie (from pre-fetch), it works.
    // - If not, Middleware will redirect them to Login (better than an Error page).
    return NextResponse.redirect(`${origin}${next}`)
}
