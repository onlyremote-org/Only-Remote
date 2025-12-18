import { NextRequest, NextResponse } from 'next/server'
import { extractTextFromPdf, extractTextFromDocx, normalizeWhitespace } from '@/lib/resume/extractText'
import { analyzeResumeForAts } from '@/lib/ai/resumeAnalysis'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        // TODO: Add authentication check here
        // const session = await auth()
        // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { success: false, error: { code: 'MISSING_FILE', message: 'No file uploaded' } },
                { status: 400 }
            )
        }

        // Validate file type
        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ]
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: { code: 'INVALID_TYPE', message: 'Only PDF and DOCX files are allowed' } },
                { status: 400 }
            )
        }

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, error: { code: 'FILE_TOO_LARGE', message: 'File size exceeds 5MB limit' } },
                { status: 400 }
            )
        }

        // Extract text
        const buffer = Buffer.from(await file.arrayBuffer())
        let text = ''

        try {
            if (file.type === 'application/pdf') {
                text = await extractTextFromPdf(buffer)
            } else {
                text = await extractTextFromDocx(buffer)
            }
            console.log('Extracted Text Length:', text.length) // Debug log
            console.log('Extracted Text Preview:', text.substring(0, 100)) // Debug log
        } catch (error) {
            console.error('Text extraction error:', error)
            return NextResponse.json(
                { success: false, error: { code: 'EXTRACTION_FAILED', message: 'Failed to extract text from file' } },
                { status: 500 }
            )
        }

        text = normalizeWhitespace(text)

        if (text.length < 200) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'TEXT_TOO_SHORT',
                        message: 'Resume text is too short or unreadable. Please upload a valid text-based resume.',
                    },
                },
                { status: 400 }
            )
        }

        // Analyze with AI
        let analysis;
        try {
            analysis = await analyzeResumeForAts(text)
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown analysis error';
            return NextResponse.json(
                { success: false, error: { code: 'ANALYSIS_ERROR', message: msg } },
                { status: 500 }
            )
        }

        if (!analysis) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'ANALYSIS_FAILED',
                        message: 'AI analysis failed. Please try again.',
                        details: 'Check server logs for more info.'
                    }
                },
                { status: 500 }
            )
        }

        // Save to database if user is authenticated
        try {
            const { createClient } = await import('@/lib/supabase/server')
            const supabase = await createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                await supabase.from('resumes').insert({
                    user_id: user.id,
                    file_name: file.name,
                    // file_type is not in the schema
                    score: analysis.overall_score,
                    // executive_summary is inside analysis json
                    analysis: analysis, // Schema expects 'analysis', not 'analysis_data'
                    created_at: new Date().toISOString(),
                })
            }
        } catch (dbError) {
            console.error('Failed to save resume to DB:', dbError)
            // We don't block the response if saving fails, but we log it
        }

        return NextResponse.json({ success: true, data: analysis })
    } catch (error) {
        console.error('Resume analysis error:', error)
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
            { status: 500 }
        )
    }
}
