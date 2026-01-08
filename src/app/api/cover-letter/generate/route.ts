import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export const maxDuration = 60

export async function POST(req: Request) {
    try {
        const { jobTitle, companyName, jobDescription, userName } = await req.json()

        // Check authentication and limits first
        const { createClient } = await import('@/lib/supabase/server')
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { checkUsageLimit } = await import('@/lib/limits')
            const { allowed } = await checkUsageLimit(user.id, 'cover_letter')

            if (!allowed) {
                return NextResponse.json(
                    { success: false, error: `Limit reached: Upgrade to Pro for unlimited cover letters.` },
                    { status: 403 }
                )
            }
        } else if (userName) {
            // Optional: If you support guest users with different limits, handle here.
            // But based on current logic, it seemed to rely on userName presence to assume 'user context'.
            // Given the requirement is strict limits for users, we'll assume logged-in users are the primary concern.
            // If they are NOT logged in, we might want to block or allow (depending on business rule).
            // For now, I'll assume only logged-in users can generate (or free guests are unlimited? unlikely).
            // I will err on side of caution: if no user, we proceed (assuming guest logic is handled elsewhere or is free/limited by IP which we don't have here).
            // BUT the original code only checked limits 'if (userName)'.
            // I will leave non-logged-in behavior as is (allow), but enforce strictly for logged-in.
        }

        if (!jobTitle || !companyName) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Fetch user's latest structured resume if logged in
        let userResumeContext = ''
        if (user) {
            const { data: resume } = await supabase
                .from('resumes')
                .select('structured_resume')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (resume?.structured_resume) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const r = resume.structured_resume as any
                userResumeContext = `
                    CANDIDATE BACKGROND:
                    Work Experience: ${JSON.stringify(r.professional_experience)}
                    Education: ${JSON.stringify(r.education)}
                    Skills: ${JSON.stringify(r.skills)}
                    Projects: ${JSON.stringify(r.projects)}
                    `
            }
        }

        const apiKey = process.env.COVER_LETTER_API_KEY || process.env.OPENROUTER_API_KEY

        if (!apiKey) {
            return NextResponse.json(
                { success: false, error: 'Server configuration error: Missing API Key' },
                { status: 500 }
            )
        }

        const openai = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: apiKey,
            defaultHeaders: {
                'HTTP-Referer': 'https://onlyremote.jobs', // Optional
                'X-Title': 'Only Remote', // Optional
            },
        })

        const prompt = `
        Write a professional and persuasive cover letter for the following job application:
        
        CANDIDATE NAME: ${userName || '[Your Name]'}
        ${userResumeContext ? userResumeContext : ''}
        
        JOB DETAILS:
        Job Title: ${jobTitle}
        Company: ${companyName}
        Job Description Snippet: "${jobDescription || ''}"
        
        The cover letter should:
        1. Be addressed to the Hiring Manager.
        2. Express enthusiasm for the role and company.
        3. Highlight relevant skills based on the job title and description.
           ${userResumeContext ? '- CRITICAL: You MUST explicitly mention 2-3 specific experiences or skills from the CANDIDATE BACKGROUND that match the JOB DETAILS. Connect the dots for the hiring manager.' : ''}
        4. Be concise (under 400 words).
        5. Use a professional tone.
        6. Include placeholders like [Your Phone Number] or [Your Email] only if necessary, but try to keep it ready to send.
        
        Output ONLY the body of the letter. Do not include "Subject:" line or markdown formatting like **bold**.
        `

        const models = [
            'google/gemini-2.0-flash-exp:free',
            'meta-llama/llama-3.3-70b-instruct:free',
            'meta-llama/llama-3.1-70b-instruct:free',
            'liquid/lfm-40b:free',
            'mistralai/mistral-7b-instruct:free',
        ]

        let content = ''
        let lastError = null

        for (const model of models) {
            try {
                console.log(`Attempting to generate cover letter with model: ${model}`)
                const completion = await openai.chat.completions.create({
                    model: model,
                    messages: [
                        { role: 'system', content: 'You are an expert career coach and professional copywriter.' },
                        { role: 'user', content: prompt },
                    ],
                })

                content = completion.choices[0]?.message?.content || ''
                if (content) break // Success
            } catch (error) {
                console.warn(`Failed with model ${model}:`, error)
                lastError = error
                // Continue to next model
            }
        }

        if (!content) {
            throw lastError || new Error('All models failed to generate content')
        }

        // Increment usage if successful
        // Increment usage if successful
        if (content && user) {
            const { incrementUsage } = await import('@/lib/limits')
            await incrementUsage(user.id, 'cover_letter')
        }

        return NextResponse.json({ success: true, coverLetter: content })
    } catch (error) {
        console.error('Cover letter generation error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to generate cover letter',
                details: String(error)
            },
            { status: 500 }
        )
    }
}
