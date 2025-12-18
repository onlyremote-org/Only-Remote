import OpenAI from 'openai'

const apiKey = process.env.OPENROUTER_API_KEY

if (!apiKey) {
    console.warn('OPENROUTER_API_KEY is not set')
}

export const aiClient = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
<<<<<<< HEAD
    apiKey: apiKey || 'dummy-key-for-build',
=======
    apiKey: apiKey,
>>>>>>> 0bb4f9956116bd27196b023c6dfaca8f0d4ed023
    defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Only Remote',
    },
})
