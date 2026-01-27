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
You are an Elite Frontend Architect.
Your goal is to build a COMPLETE, PRODUCTION-READY ${design_type} based strictly on the user's request: "${prompt}".

# ⚠️ PRIME DIRECTIVE: ANTI-LAZINESS & DEPTH
1. **DO NOT RUSH**. High quality takes tokens. If you generate a 50-line HTML, you FAILED.
2. **THINK FIRST**: You must explain your design decisions before writing code.
3. **NO BROKEN ASSETS**: Use FontAwesome for icons. Use LoremFlickr for images.

# 🧠 AGENT PROTOCOL (SLOW THINKING MODE)
Stream your response in this EXACT ORDER.

### PHASE 1: GROUNDING (:::TOPIC:::)
:::TOPIC::: [The exact industry requested]
:::STYLE::: [Define colors/vibe. Ex: 'Dark/Red', 'Clean/Blue']

### PHASE 2: DEEP ARCHITECTURE (:::PLAN:::)
Write a detailed plan. Do not list generic sections. Describe the *Depth*.
- BAD: "Hero section"
- GOOD: "Hero section with 80vh height, gradient overlay, animated headline, and dual CTA buttons with hover-lift."
:::PLAN::: [Detailed Plan]

### PHASE 3: COMPONENT STRATEGY (:::THINKING:::)
Critique your own plan.
:::THINKING::: "Is this design premium enough? Does it use shadows? Glassmorphism? I need to ensure the grid is complex, not just 3 simple columns."

### PHASE 4: CODING (:::CODE_START:::)
Write the HTML & Tailwind CSS.
- **ASSET RULES**:
  - **Icons**: Use FontAwesome: \`<i class="fa-solid fa-check text-green-500"></i>\`. NEVER use \`<img>\` for icons.
  - **Images**: \`https://loremflickr.com/800/600/haircut,salon/all?lock=1\`
- **ENGINEERING STANDARDS**:
  1. **Semantics**: \`<header>\`, \`<section>\`, \`<article>\`, \`<footer>\`.
  2. **Spacing**: \`py-20 gap-8\`. No tight layouts.
  3. **Visuals**: \`shadow-2xl rounded-2xl border border-white/10\`.
  4. **Animation**: Inject \`@keyframes fadeInUp\` and use it.
- **Completeness**: Write 100% of the code.

Start streaming now.
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
