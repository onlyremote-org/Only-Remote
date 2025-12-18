import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: Request) {
    try {
        const { jobTitle, companyName, jobDescription, userName } = await req.json()

        if (!jobTitle || !companyName) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            )
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
        
        Candidate Name: ${userName || '[Your Name]'}
        Job Title: ${jobTitle}
        Company: ${companyName}
        Job Description Snippet: "${jobDescription || ''}"
        
        The cover letter should:
        1. Be addressed to the Hiring Manager.
        2. Express enthusiasm for the role and company.
        3. Highlight relevant skills based on the job title and description.
        4. Be concise (under 400 words).
        5. Use a professional tone.
        6. Include placeholders like [Your Phone Number] or [Your Email] only if necessary, but try to keep it ready to send.
        
        Output ONLY the body of the letter. Do not include "Subject:" line or markdown formatting like **bold**.
        `

        const models = [
            'google/gemini-2.0-flash-exp:free',
            'meta-llama/llama-3.1-70b-instruct:free',
            'mistralai/mistral-7b-instruct:free',
            'microsoft/phi-3-medium-128k-instruct:free',
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
