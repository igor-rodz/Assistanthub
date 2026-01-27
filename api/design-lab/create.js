import {
    getGeminiModel,
    getSupabase,
    requireAuth,
    checkSufficientCredits,
    deductCredits,
    uuidv4,
    getRequestBody,
    corsHeaders
} from '../_helpers.js';

// DesignLab Brain: Streaming Implementation
// Focus: Bypass Vercel timeouts by streaming chunks immediately

export const config = {
    // runtime: 'edge', // Edge is good for streaming, but Node.js is safer for Supabase compat currently.
    // We will use standard Node.js streaming response.
    maxDuration: 60 // Giving us max time, but streaming starts instantly
};

export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).set(corsHeaders()).end();
        return;
    }

    // Set CORS headers for all responses
    Object.entries(corsHeaders()).forEach(([key, value]) => {
        res.setHeader(key, value);
    });

    try {
        // 1. Auth & Credits Check (Fast)
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) throw { status: 401, message: "Unauthorized" };

        const supabase = await getSupabase();
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) throw { status: 401, message: "Invalid token" };

        const body = req.body; // Vercel parses JSON body auto
        const { prompt, design_type = "component", fidelity = "high" } = body;

        if (!prompt) throw { status: 400, message: "Missing prompt" };

        // Quick credit check
        const { hasCredits } = await checkSufficientCredits(user.id, 1.0);
        if (!hasCredits) throw { status: 402, message: "Insufficient credits" };

        // 2. Setup Headers for Streaming
        res.setHeader('Content-Type', 'text/plain; charset=utf-8'); // Raw streaming
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        // Disable simple buffering proxy
        res.setHeader('X-Accel-Buffering', 'no');

        // 3. Construct Prompt (High Quality Prompt)
        const systemPrompt = `
# ROLE
You are an expert UI/UX designer and front-end engineer.
Your task is to generate a COMPLETE, PRODUCTION-READY HTML file based on the user's request.

# OUTPUT FORMAT
You must stream the response as a valid JSON object.
Structure:
{
  "explanation": "Brief summary",
  "html": "<!DOCTYPE html>...",
  "css": "ignored (embed in html)"
}

# REQUIREMENTS
1. **NO PLACEHOLDERS**. Use real content.
2. **COMPLETE**. If dashboard, build the sidebar, header, charts (mocked with HTML/CSS).
3. **SINGLE FILE**. HTML should contain Tailwind CDN.
4. **QUALITY**. Use beautiful gradients, shadows, whitespace.
5. **ANIMATIONS**. Use hover effects, transitions.
6. **CODE STYLE**. Clean, readable HTML5 + Tailwind.

User Request: "${prompt}"
Design Type: ${design_type}
`;

        // 4. Init Gemini with Streaming
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY?.trim());
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8192, // High limit allowed by streaming
            }
        });

        const result = await model.generateContentStream(systemPrompt);

        // 5. Stream chunks
        let fullText = '';

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            // Send chunk to client
            res.write(chunkText);
        }

        // 6. Async: Deduct credits & Log to DB (After stream ends)
        try {
            const cleanJson = fullText.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonStart = cleanJson.indexOf('{');
            const jsonEnd = cleanJson.lastIndexOf('}');

            if (jsonStart > -1 && jsonEnd > -1) {
                const designData = JSON.parse(cleanJson.substring(jsonStart, jsonEnd + 1));

                const tokensIn = Math.ceil(systemPrompt.length / 4);
                const tokensOut = Math.ceil(fullText.length / 4);

                await deductCredits(user.id, 0.5, 'design_job', `Design: ${prompt.substring(0, 20)}`, tokensIn, tokensOut);

                await supabase.from('design_jobs').insert({
                    job_id: uuidv4(),
                    user_id: user.id,
                    status: "complete",
                    html: designData.html,
                    css: "",
                    prompt: prompt,
                    credits_used: 0.5,
                    tokens_input: tokensIn,
                    tokens_output: tokensOut,
                    created_at: new Date().toISOString()
                });
            }
        } catch (postProcessErr) {
            console.error("Post-processing error:", postProcessErr);
        }

        res.end();

    } catch (error) {
        console.error("Stream Error:", error);
        if (!res.headersSent) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error"
            });
        } else {
            res.end();
        }
    }
}
