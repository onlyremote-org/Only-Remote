import { aiClient } from './client'

export interface ResumeAnalysis {
    summary: string
    strengths: string[]
    weaknesses: string[]
    jobMatchScore: number
    recommendations: string[]
}

export async function analyzeResume(resumeText: string, jobDescription?: string): Promise<ResumeAnalysis | null> {
    try {
        const prompt = `
You are an expert technical recruiter and career coach. Analyze the following resume text and provide constructive feedback.
${jobDescription ? `Also compare it against this job description: "${jobDescription}"` : ''}

Resume Text:
"${resumeText.slice(0, 4000)}" // Truncate to avoid token limits if necessary

Provide the output in the following JSON format ONLY:
{
    "summary": "A brief professional summary of the candidate.",
    "strengths": ["List of 3-5 key strengths"],
    "weaknesses": ["List of 3-5 areas for improvement"],
    "jobMatchScore": 0-100 (integer, estimate based on generic remote roles if no JD provided),
    "recommendations": ["List of 3-5 actionable steps to improve the resume"]
}
`

        const models = [
            'google/gemini-2.0-flash-exp:free',
            'meta-llama/llama-3.3-70b-instruct:free',
            'mistralai/mistral-7b-instruct:free',
        ]

        let content = ''
        let lastError = null

        for (const model of models) {
            try {
                console.log(`Attempting to analyze resume with model: ${model}`)
                const completion = await aiClient.chat.completions.create({
                    model: model,
                    messages: [
                        { role: 'system', content: 'You are a helpful AI assistant that analyzes resumes and outputs JSON.' },
                        { role: 'user', content: prompt },
                    ],
                    response_format: { type: 'json_object' },
                })

                content = completion.choices[0].message.content || ''
                if (content) break // Success
            } catch (error) {
                console.warn(`Failed with model ${model}:`, error)
                lastError = error
                // Continue to next model
            }
        }

        if (!content) {
            throw lastError || new Error('All models failed to analyze resume')
        }

        const result = JSON.parse(content) as ResumeAnalysis
        return result
    } catch (error) {
        console.error('Error analyzing resume:', error)
        throw error // Propagate error for UI handling
    }
}
