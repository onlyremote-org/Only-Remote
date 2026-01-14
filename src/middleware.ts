import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (user) {
        // Fetch profile to check onboarding status
        // OPTIMIZATION: Check metadata first to avoid DB call
        let isCompleted = user.user_metadata?.onboarding_completed

        // Fallback to DB if metadata is missing (migration support)
        if (isCompleted === undefined) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('onboarding_completed')
                .eq('id', user.id)
                .single()

            isCompleted = profile?.onboarding_completed
        }

        const isOnboarding = request.nextUrl.pathname.startsWith('/onboarding')
        const isAuthRoute = request.nextUrl.pathname.startsWith('/auth') || request.nextUrl.pathname.startsWith('/verify-email')


        // If not completed and not on onboarding (and not an auth route), redirect to onboarding
        if (!isCompleted && !isOnboarding && !isAuthRoute) {
            return NextResponse.redirect(new URL('/onboarding', request.url))
        }

        // If completed and trying to access onboarding, redirect to dashboard
        if (isCompleted && isOnboarding) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        // Redirect authenticated users from landing page to jobs
        if (request.nextUrl.pathname === '/') {
            return NextResponse.redirect(new URL('/jobs', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
