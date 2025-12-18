import { NextRequest, NextResponse } from 'next/server'
import { fetchAggregatedJobs } from '@/lib/jobs/aggregate'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q') || undefined
    const category = searchParams.get('category') || undefined
    const location = searchParams.get('location') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const sourcesParam = searchParams.get('sources')
    const sources = sourcesParam ? sourcesParam.split(',') : undefined

    try {
        const { jobs, total } = await fetchAggregatedJobs({
            q,
            category,
            location,
            limit,
            sources,
        })

        return NextResponse.json({
            jobs,
            total,
            page: 1,
            pageSize: jobs.length,
        })
    } catch (error) {
        console.error('Error in jobs API:', error)
        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
    }
}
