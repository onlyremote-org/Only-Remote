import OpenAI from 'openai'

const apiKey = process.env.OPENROUTER_API_KEY

if (!apiKey) {
    console.warn('OPENROUTER_API_KEY is not set')
}

export const aiClient = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: apiKey,
    defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Only Remote',
    },
})
