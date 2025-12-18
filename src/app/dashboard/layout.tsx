import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signout } from '@/app/auth/actions'
import { LayoutDashboard, User, FileText, Settings, CreditCard, LogOut } from 'lucide-react'
import { Sidebar, SidebarBody, SidebarLink, SidebarBrand } from '@/components/ui/sidebar'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const links = [
        {
            label: "Overview",
            href: "/dashboard",
            icon: (
                <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Profile",
            href: "/dashboard/profile",
            icon: (
                <User className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Resume",
            href: "/dashboard/resume",
            icon: (
                <FileText className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Preferences",
            href: "/dashboard/preferences",
            icon: (
                <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Subscription",
            href: "/dashboard/subscription",
            icon: (
                <CreditCard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
    ];

    return (
        <div className={cn(
            "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-7xl mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
            "h-screen"
        )}>
            <Sidebar>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        <div className="flex flex-col gap-2">
                            <SidebarBrand
                                logo={
                                    <div className="h-7 w-7 relative flex-shrink-0">
                                        <Image
                                            src="/logo-v2.png"
                                            alt="Only Remote Logo"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                }
                                title=""
                            />
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="flex flex-col gap-2">
                            <form action={signout}>
                                <button
                                    type="submit"
                                    className="flex items-center justify-start gap-2 group/sidebar py-2 px-2 w-full hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
                                >
                                    <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                                    <span className="text-neutral-700 dark:text-neutral-200 text-sm whitespace-pre inline-block">
                                        Sign out
                                    </span>
                                </button>
                            </form>
                            <SidebarLink
                                link={{
                                    label: user.email || "User",
                                    href: "/dashboard/profile",
                                    icon: (
                                        <div className="h-7 w-7 flex-shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                                            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-300">
                                                {user.email?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    ),
                                }}
                            />
                        </div>
                    </div>
                </SidebarBody>
            </Sidebar>
            <main className="flex-1 overflow-y-auto bg-white dark:bg-neutral-900">
                <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
                    {children}
                </div>
            </main>
        </div>
    )
}
