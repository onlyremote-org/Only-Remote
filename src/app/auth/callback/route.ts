import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/jobs'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
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

                    // Redirect to onboarding for new users
                    return NextResponse.redirect(`${origin}/onboarding`)
                } else if (!profile.onboarding_completed) {
                    // Redirect to onboarding if incomplete
                    return NextResponse.redirect(`${origin}/onboarding`)
                }
            }

            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
