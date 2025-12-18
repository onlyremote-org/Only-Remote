
import * as dotenv from 'dotenv';
// Load environment variables before other imports
dotenv.config({ path: '.env.local' });

async function main() {
    console.log('Testing AI Resume Analysis...');

    // Dynamic import to ensure env vars are loaded first
    const { analyzeResumeForAts } = await import('../src/lib/ai/resumeAnalysis');

    const sampleText = `
    John Doe
    Software Engineer
    
    Experience:
    - Senior Developer at Tech Corp (2020-Present)
      - Built scalable web apps using Next.js and TypeScript.
      - Improved performance by 50%.
    
    Skills: JavaScript, TypeScript, React, Node.js
    `;

    try {
        process.env.OPENROUTER_RESUME_MODEL = 'mistralai/mistral-7b-instruct:free';
        const result = await analyzeResumeForAts(sampleText);
        console.log('Analysis Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Test Failed:', error);
    }
}

main();
