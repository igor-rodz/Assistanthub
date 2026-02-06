import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

async function testGemini() {
    console.log('--- Testing Gemini Connection ---');
    const key = process.env.GEMINI_API_KEY;
    console.log('API Key present:', !!key);

    if (!key) {
        console.error('ERROR: No API Key found in .env');
        return;
    }

    const genAI = new GoogleGenerativeAI(key);

    // Test the specific model string we are using
    const modelName = "gemini-2.5-flash"; // Strict rule check
    console.log(`Attempting to use model: ${modelName}`);

    const model = genAI.getGenerativeModel({ model: modelName });

    try {
        const result = await model.generateContent("Hello, are you online?");
        const response = await result.response;
        console.log('SUCCESS! Response:', response.text());
    } catch (error) {
        console.error('FAILED to generate content.');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
    }
}

testGemini();
