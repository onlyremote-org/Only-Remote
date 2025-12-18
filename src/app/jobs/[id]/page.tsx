import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getJob } from '@/lib/api/jobs'

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await getJob(id)

  if (!job) {
    notFound()
  }

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <Link href="/jobs" className="text-sm font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            ← Back to Jobs
          </Link>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {job.title}
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            {job.company_name} • {job.location || 'Remote'}
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-2xl gap-x-8 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none">
          <div className="prose prose-lg prose-indigo text-gray-500">
            <p className="whitespace-pre-wrap">{job.description}</p>
          </div>
          <div className="mt-10">
            <a
              href={job.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Apply for this job
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
