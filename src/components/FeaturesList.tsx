'use client'

import { Search, FileText, Zap, Sparkles, Globe } from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
    {
        name: 'Daily Remote Listings',
        description: 'Fresh remote opportunities added every 24 hours from top tech companies.',
        icon: Search,
    },
    {
        name: 'AI Resume Scanner',
        description: 'Optimize your resume with our advanced AI to beat ATS systems.',
        icon: FileText,
    },
    {
        name: 'Global Opportunities',
        description: 'Find work-from-anywhere roles that truly respect your location freedom.',
        icon: Zap,
    },
    {
        name: 'AI Cover Letter Generation',
        description: 'Instantly generate tailored cover letters for each job application using advanced AI.',
        icon: Sparkles,
    },
    {
        name: 'H1-B Job Filtering',
        description: 'Easily filter and find roles that offer H1-B visa sponsorship.',
        icon: Globe,
    },
]

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
}

export default function FeaturesList() {
    return (
        <div className="h-full w-full bg-card p-8 flex flex-col justify-center">
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 gap-8 sm:grid-cols-2"
            >
                {features.map((feature) => (
                    <motion.div key={feature.name} variants={item} className="relative pl-16">
                        <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <feature.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                        </div>
                        <div className="text-base font-semibold leading-7 text-foreground">
                            {feature.name}
                        </div>
                        <div className="mt-2 text-base leading-7 text-muted-foreground">
                            {feature.description}
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    )
}
