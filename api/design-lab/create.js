import {
    getGeminiModel,
    getSupabase,
    deductCredits,
    uuidv4,
    corsHeaders
} from '../_helpers.js';

export const config = {
    // Max duration for Pro plan is higher, but for Hobby 10s is limit without streaming.
    // Streaming bypasses this limit effectively for the connection, but execution time matters.
    // We keep it strictly streaming to avoid timeouts.
    maxDuration: 60
};

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.status(200).set(corsHeaders()).end();
        return;
    }

    Object.entries(corsHeaders()).forEach(([key, value]) => {
        res.setHeader(key, value);
    });

    try {
        // 1. Auth & Input Validation
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) throw { status: 401, message: "Unauthorized" };

        const supabase = await getSupabase();
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) throw { status: 401, message: "Invalid token" };

        const { prompt, design_type = "landing_page", fidelity = "high" } = req.body;
        if (!prompt) throw { status: 400, message: "Prompt is required" };

        // 2. Setup Streaming Headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        // Prevent buffering
        res.setHeader('X-Accel-Buffering', 'no');

        // 3. Initialize Gemini with HIGH Token Limit
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp", // Experimental model usually has better reasoning
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8192, // Increased limit for full pages
            }
        });

        // 4. The "Real Agent" System Prompt
        // We instruct the model to think out loud and emit events before code.
        const systemPrompt = `
You are a professional UI designer and Frontend Developer.
Your task is to generate a high-quality, professional website based on the user's request: "${prompt}".

# INSTRUCTIONS
1. **Design**: Use Tailwind CSS for styling. Create a modern, clean, and responsive design.
2. **Icons**: YOU MUST USE FontAwesome CDN for icons: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />. Use <i class="fa-solid fa-check"></i> syntax.
3. **Images**: YOU MUST USE LoremFlickr for placeholder images: https://loremflickr.com/800/600/keyword.
4. **Structure**: Write semantic HTML5 (header, section, footer).
5. **Output**: Output ONLY the complete HTML code. Do not include markdown code blocks (\`\`\`html) or explanations inside the final code stream.

:::CODE_START:::
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Design</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
</head>
<body class="font-sans antialiased text-gray-900 bg-white">
`;

        const result = await model.generateContentStream(systemPrompt);

        // 5. Stream Pipe
        let accumulatedCode = '';
        let insideCodeBlock = false;

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();

            // Simple pass-through of the agent's raw stream
            // The frontend will parse the :::PREFIX::: tags
            res.write(chunkText);

            // Accumulate code for DB saving later (naive logic)
            if (chunkText.includes(':::CODE_START:::')) insideCodeBlock = true;
            if (chunkText.includes(':::CODE_END:::')) insideCodeBlock = false;
            if (insideCodeBlock) accumulatedCode += chunkText.replace(':::CODE_START:::', '');
        }

        // 6. DB Saving (Fire and forget, best effort)
        try {
            // We try to extract the HTML roughly from the accumulated text
            // Ideally we'd parse it better, but for logging history this acts as backup.
            if (accumulatedCode.length > 50) {
                const tokensIn = Math.ceil(systemPrompt.length / 4);
                const tokensOut = Math.ceil(accumulatedCode.length / 4);

                // Deduct credits
                await deductCredits(user.id, 0.5, 'design_job_v2', `Design: ${prompt.substring(0, 20)}`, tokensIn, tokensOut);
            }
        } catch (dbErr) {
            console.error('DB Log Error:', dbErr);
        }

        res.end();

    } catch (error) {
        console.error("Agent Error:", error);
        res.write(`\n:::ERROR::: ${error.message || "Internal Error"}\n`);
        res.end();
    }
}
