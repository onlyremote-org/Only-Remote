'use server'

import { createClient } from '@/lib/supabase/server'
import { scanResume } from '@/lib/ai/scanner'
import { revalidatePath } from 'next/cache'

export async function uploadResume(_prevState: any, formData: FormData) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated', success: false, data: null }
    }

    const file = formData.get('resume') as File
    if (!file) {
        return { error: 'No file uploaded', success: false, data: null }
    }

    // In a real app, we would parse the PDF/Docx here.
    // For this MVP, we'll assume the user pastes text or we use a mock text.
    // Let's change the input to a text area for MVP simplicity or mock the parsing.

    // Mock parsing for now (simulating text extraction from file)
    const resumeText = "Experienced software engineer with React and Node.js skills. Looking for a challenging role in a remote-first company."

    // Mock job description for matching (or let user input it)
    const jobDescription = "Looking for a Senior Frontend Engineer with React experience."

    // Check limits
    const { checkUsageLimit, incrementUsage } = await import('@/lib/limits')
    const { allowed, limit, count } = await checkUsageLimit(user.id, 'resume_scan')

    if (!allowed) {
        return {
            error: `You have reached your monthly limit of ${limit} resume scans. Upgrade to Pro for unlimited scans!`,
            success: false,
            data: null
        }
    }

    // Use the real AI service
    const { analyzeResume } = await import('@/lib/ai/resume')
    const scanResult = await analyzeResume(resumeText, jobDescription)

    if (!scanResult) {
        return { error: 'Failed to analyze resume. Please try again.', success: false, data: null }
    }

    // Save result to DB
    const { error: saveError } = await supabase
        .from('resumes')
        .insert({
            user_id: user.id,
            file_name: file.name,
            content: resumeText,
            score: scanResult.jobMatchScore,
            analysis: scanResult,
        })

    if (saveError) {
        console.error('Error saving resume:', saveError)
        // We don't fail the whole request if saving fails, but we should log it
    } else {
        // Increment usage count only on successful save/scan
        await incrementUsage(user.id, 'resume_scan')
    }



    revalidatePath('/dashboard')
    return { success: true, data: scanResult, error: '' }
}
