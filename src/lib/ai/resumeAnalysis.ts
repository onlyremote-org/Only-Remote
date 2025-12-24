import { aiClient } from './client'
import { ResumeAnalysisResponse } from './types'

export async function analyzeResumeForAts(resumeText: string): Promise<ResumeAnalysisResponse | null> {
  const models = [
    process.env.OPENROUTER_RESUME_MODEL || 'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3-8b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
    'microsoft/phi-3-medium-128k-instruct:free'
  ]

  let lastError: Error | null = null

  for (const model of models) {
    try {
      console.log(`Attempting analysis with model: ${model}`)

      const prompt = `
You are an expert, merciless ATS (Applicant Tracking System) resume auditor and career coach.
Analyze the following resume text and provide a detailed report in JSON format.

RESUME TEXT START:
${resumeText.slice(0, 15000)} 
RESUME TEXT END

Your Goals:
1. Maximize the resume's ATS parseability (logical structure, keywords).
2. Maximize human readability (impact, brevity, active voice).

Analyze on these specific dimensions:
1. Impact & Quantification: Identify vague bullet points that lack numbers, metrics, or strong action verbs.
2. Technical Terminology: Identify missing hard skills, misused buzzwords, or weak keyword density for the implied role.
3. Logical Structure (Content-only): Check for essential sections (Experience, Skills) and clear contact info. Do NOT judge visual margins or fonts as you cannot see the design.

Output ONLY valid JSON matching this schema:
{
  "overall_score": 0,
  "executive_summary": "string (2 sentences)",
  "sections": {
    "impact": { "score": 0.0, "issues": [{ "original_text": "string", "issue": "string", "improvement": "string" }] },
    "terminology": { "score": 0.0, "issues": [{ "original_text": "string", "issue": "string", "improvement": "string" }] },
    "structure": { "score": 0.0, "issues": [{ "location_hint": "string", "issue": "string", "improvement": "string" }] }
  },
  "global_recommendations": ["string"],
  "extracted_skills": ["string"],
  "structured_resume": {
    "professional_experience": [
      { "company": "string", "role": "string", "start_date": "string", "end_date": "string", "description": "string (summarize key achievements)" }
    ],
    "education": [
      { "institution": "string", "degree": "string", "field": "string", "start_date": "string", "end_date": "string" }
    ],
    "projects": [
      { "name": "string", "description": "string", "technologies": ["string"] }
    ],
    "skills": [
      { "category": "string (e.g. Languages, Frameworks)", "skills": ["string"] }
    ]
  }
}

Scoring Rules:
- 0-100 integer scale.
- Be harsh. A score of 100 means the resume is perfect.

INSTRUCTIONS FOR 'structured_resume':
- Extract facts objectively. Do not embellish.
- Normalize dates to 'YYYY-MM' or 'YYYY'. Use 'Present' for current jobs.
- If a section is missing, return an empty array.

CRITICAL INSTRUCTIONS FOR 'original_text':
- Quote resume text EXACTLY for highlighting.

CRITICAL INSTRUCTIONS FOR 'improvement':
- Use active voice and metrics.
`

      const completion = await aiClient.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: 'You are a strict ATS resume analyzer. Output valid JSON only. Do not output markdown blocks.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      })

      console.log(`OpenRouter Response (${model}):`, JSON.stringify(completion, null, 2))

      const content = completion.choices[0].message.content

      if (!content) {
        throw new Error(`Model ${model} returned null content`)
      }

      // Strip markdown code blocks if present
      let jsonString = content.replace(/```json\n?|```/g, '').trim()

      // Find the first '{' and last '}'
      const firstOpen = jsonString.indexOf('{')
      const lastClose = jsonString.lastIndexOf('}')

      if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
        jsonString = jsonString.substring(firstOpen, lastClose + 1)
      } else if (jsonString.length > 0 && (firstOpen === -1 || lastClose === -1)) {
        console.error(`No JSON structure found in response from ${model}:`, jsonString)
        throw new Error(`AI response from ${model} did not contain valid JSON structure.`)
      }

      if (jsonString.length === 0) {
        throw new Error(`Model ${model} returned empty response after cleanup.`)
      }

      let result: ResumeAnalysisResponse
      try {
        result = JSON.parse(jsonString) as ResumeAnalysisResponse
      } catch (parseError) {
        console.error(`JSON Parse Error (${model}). Raw string:`, jsonString)
        throw new Error(`Failed to parse AI response from ${model}: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`)
      }

      // Validate score
      if (typeof result.overall_score !== 'number') result.overall_score = 0
      result.overall_score = Math.max(0, Math.min(100, result.overall_score))
      if (!result.extracted_skills) result.extracted_skills = []

      return result

    } catch (error) {
      console.error(`Error with model ${model}:`, error)
      lastError = error instanceof Error ? error : new Error(String(error))
      // Continue to next model
    }
  }

  // If we get here, all models failed
  console.error('All models failed to analyze resume.')
  throw new Error(`Analysis failed after trying multiple models. Last error: ${lastError?.message}`)
}
