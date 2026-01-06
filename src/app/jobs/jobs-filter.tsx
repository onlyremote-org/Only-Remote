'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, MapPin, Briefcase, Filter, ArrowUpDown } from 'lucide-react'

export function JobsFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [query, setQuery] = useState(searchParams.get('q') || '')
    const [location, setLocation] = useState(searchParams.get('location') || '')
    const [jobType, setJobType] = useState(searchParams.get('job_type') || '')
    const [sort, setSort] = useState(searchParams.get('sort') || 'newest')

    // Debounce search inputs
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString())

            // Only update if value changed
            const currentQ = params.get('q') || ''
            if (query !== currentQ) {
                if (query) params.set('q', query)
                else params.delete('q')
            }

            const currentLocation = params.get('location') || ''
            if (location !== currentLocation) {
                if (location) params.set('location', location)
                else params.delete('location')
            }

            const currentType = params.get('job_type') || ''
            if (jobType !== currentType) {
                if (jobType) params.set('job_type', jobType)
                else params.delete('job_type')
            }

            const currentSort = params.get('sort') || 'newest'
            if (sort !== currentSort) {
                if (sort) params.set('sort', sort)
                else params.delete('sort')
            }

            // Only push if params actually changed
            if (params.toString() !== searchParams.toString()) {
                router.push(`/jobs?${params.toString()}`, { scroll: false })
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [query, location, jobType, sort, router, searchParams])

    return (
        <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search by job title, company, or keywords..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-xl bg-card border border-white/10 pl-12 pr-4 py-3 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[200px]">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Location (e.g. Remote, US, Europe)"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full rounded-lg bg-card border border-white/10 pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>

                <div className="relative flex-1 min-w-[200px]">
                    <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <select
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value)}
                        className="w-full rounded-lg bg-card border border-white/10 pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                    >
                        <option value="">All Job Types</option>
                        <option value="full-time">Full-time</option>
                        <option value="contract">Contract</option>
                        <option value="part-time">Part-time</option>
                        <option value="freelance">Freelance</option>
                        <option value="internship">Internship</option>
                        <option value="h1b">H-1B Visa Sponsorship</option>
                        <option value="global-sponsorship">Global Sponsorship</option>
                    </select>
                </div>

                <div className="relative min-w-[160px]">
                    <ArrowUpDown className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="w-full rounded-lg bg-card border border-white/10 pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            </div>
        </div>
    )
}
