<<<<<<< HEAD
import { aiClient } from './client'

const openai = aiClient
=======
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
})
>>>>>>> 0bb4f9956116bd27196b023c6dfaca8f0d4ed023

export async function scanResume(resumeText: string, jobDescription: string) {
    try {
        const completion = await openai.chat.completions.create({
            model: 'openai/gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content:
                        'You are an expert ATS (Applicant Tracking System) scanner. Analyze the resume against the job description. Provide a match score (0-100), key missing keywords, and specific improvement suggestions. Return JSON only.',
                },
                {
                    role: 'user',
                    content: `Resume: ${resumeText}\n\nJob Description: ${jobDescription}`,
                },
            ],
            response_format: { type: 'json_object' },
        })

        const result = JSON.parse(completion.choices[0].message.content || '{}')
        return result
    } catch (error) {
        console.error('AI Scan Error:', error)
        return null
    }
}
