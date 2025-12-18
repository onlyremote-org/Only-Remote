import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { signout } from '@/app/auth/actions'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function Navbar() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between items-center">
                    <div className="flex items-center gap-8">
                        {/* Logo positioned absolutely in the center */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                                <div className="relative h-20 w-auto min-w-[80px]">
                                    <Image
                                        src="/logo-v2.png"
                                        alt="Only Remote Logo"
                                        height={80}
                                        width={80}
                                        className="object-contain brightness-0 dark:invert"
                                        priority
                                    />
                                </div>
                            </Link>
                        </div>

                        {user && (
                            <div className="hidden sm:flex sm:space-x-6">
                                <Link
                                    href="/jobs"
                                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                                >
                                    Find Jobs
                                </Link>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        {user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Dashboard
                                </Link>
                                <form action={signout}>
                                    <button
                                        type="submit"
                                        className="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 ring-1 ring-border"
                                    >
                                        Sign out
                                    </button>
                                </form>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/signup"
                                    className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40"
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
