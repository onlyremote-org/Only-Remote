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
  "executive_summary": "string (2 sentences on the overall strength)",
  "sections": {
    "impact": {
      "score": 0.0,
      "issues": [
        {
          "original_text": "string (EXACT text substring from resume to highlight)",
          "issue": "string (Short explanation of the flaw)",
          "improvement": "string (Specific rewrite of the sentence with better metrics/verbs)"
        }
      ]
    },
    "terminology": {
      "score": 0.0,
      "issues": [
        {
          "original_text": "string (EXACT text substring, or empty string if global issue)",
          "issue": "string",
          "improvement": "string (e.g. 'Replace X with Y' or 'Add keyword Z')"
        }
      ]
    },
    "structure": {
      "score": 0.0,
      "issues": [
        {
          "location_hint": "string (e.g. 'Header', 'Experience Section')",
          "issue": "string",
          "improvement": "string"
        }
      ]
    }
  },
  },
  "global_recommendations": ["string"],
  "extracted_skills": ["string (List of top 10-15 hard/soft skills found in the resume)"]
}

Scoring Rules:
- 0-100 integer scale.
- Be harsh. A score of 100 means the resume is perfect.

CRITICAL INSTRUCTIONS FOR 'original_text':
- You must quote the resume text EXACTLY as it appears (including typos or punctuation) so the software can find and highlight it.
- If the text is too long, quote the first 10 words ... last 10 words.
- If the issue is a "Missing Skill" (not text), leave 'original_text' empty.

CRITICAL INSTRUCTIONS FOR 'improvement':
- Do not just complain. Fix it.
- Bad: "Add metrics."
- Good: "Rewrite as: 'Reduced server costs by 20% ($5k/mo) by optimizing AWS EC2 instances.'"
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
