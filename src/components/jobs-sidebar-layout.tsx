'use client'

import React, { useState } from 'react'
import { Sidebar, SidebarBody, SidebarLink, SidebarBrand } from '@/components/ui/sidebar'
import {
    LayoutDashboard,
    User,
    FileText,
    Settings,
    CreditCard,
    LogOut,
    Briefcase
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { signout } from '@/app/auth/actions'
import { User as SupabaseUser } from '@supabase/supabase-js'

interface JobsSidebarLayoutProps {
    children: React.ReactNode
    user: SupabaseUser | null
}

export function JobsSidebarLayout({ children, user }: JobsSidebarLayoutProps) {
    const links = [
        {
            label: "Find Jobs",
            href: "/jobs",
            icon: (
                <Briefcase className="text-muted-foreground h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Overview",
            href: "/dashboard",
            icon: (
                <LayoutDashboard className="text-muted-foreground h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Profile",
            href: "/dashboard/profile",
            icon: (
                <User className="text-muted-foreground h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Resume",
            href: "/dashboard/resume",
            icon: (
                <FileText className="text-muted-foreground h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Preferences",
            href: "/dashboard/preferences",
            icon: (
                <Settings className="text-muted-foreground h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Subscription",
            href: "/dashboard/subscription",
            icon: (
                <CreditCard className="text-muted-foreground h-5 w-5 flex-shrink-0" />
            ),
        },
    ]
    const [open, setOpen] = useState(false)
    return (
        <div
            className={cn(
                'rounded-md flex flex-col md:flex-row bg-muted/20 w-full flex-1 mx-auto border border-border',
                'min-h-[calc(100vh-4rem)] md:h-screen md:overflow-hidden'
            )}
        >
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10 bg-muted">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        <div className="flex flex-col gap-2">
                            <SidebarBrand
                                logo={
                                    <div className="h-7 w-7 relative flex-shrink-0">
                                        <Image
                                            src="/logo-v2.png"
                                            alt="Only Remote Logo"
                                            fill
                                            className="object-contain brightness-0 dark:invert"
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
                        {user ? (
                            <div className="flex flex-col gap-2">
                                <form action={signout}>
                                    <button
                                        type="submit"
                                        className="flex items-center justify-start gap-2 group/sidebar py-2 px-2 w-full hover:bg-background/50 rounded-md transition-colors"
                                    >
                                        <LogOut className="text-muted-foreground h-5 w-5 flex-shrink-0" />
                                        <motion.span
                                            animate={{
                                                display: open ? "inline-block" : "none",
                                                opacity: open ? 1 : 0,
                                            }}
                                            className="text-muted-foreground text-sm whitespace-pre inline-block"
                                        >
                                            Sign out
                                        </motion.span>
                                    </button>
                                </form>
                                <SidebarLink
                                    link={{
                                        label: user.email || "User",
                                        href: "/dashboard/profile",
                                        icon: (
                                            <div className="h-7 w-7 flex-shrink-0 rounded-full bg-background flex items-center justify-center border border-border">
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    {user.email?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        ),
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <SidebarLink
                                    link={{
                                        label: "Sign in",
                                        href: "/login",
                                        icon: (
                                            <User className="text-muted-foreground h-5 w-5 flex-shrink-0" />
                                        ),
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </SidebarBody>
            </Sidebar>
            <div className="flex flex-1">
                <div className="p-4 md:p-10 rounded-tl-2xl border border-border bg-background flex flex-col gap-2 flex-1 w-full h-full md:overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    )
}
