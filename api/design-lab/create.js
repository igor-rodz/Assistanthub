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
You are an Autonomous Senior Frontend Engineer & UI/UX Designer.
Your goal is to build a COMPLETE, PRODUCTION-READY ${design_type} based on the user's request: "${prompt}".

# DESIGN INTELLIGENCE (MANDATORY)
You have been trained on the 'frontend-design' skill. You MUST apply these principles:

1. **PHILOSOPHY**: "Restraint is luxury." Do not over-design. Every pixel must have a purpose.
2. **ANTI-PATTERNS (AVOID THESE)**:
   - 🚫 **Bento Grids**: Do not use bento grids unless specifically asked. They are a cliché.
   - 🚫 **Default Blue/Purple**: Avoid the "AI Safety Color". Pick a radical, brand-appropriate palette (e.g., Emerald, Slate, Orange, monochromatic).
   - 🚫 **Glassmorphism everywhere**: Use it only for radical emphasis, not as a default card style.
   - 🚫 **Lorem Ipsum**: Use REAL, context-aware copy. Write like a human copywriter.

3. **LAYOUT & SPACING**:
   - Use the **8-point grid** principle (Tailwind: p-4, p-6, p-8, gap-4, gap-8).
   - Use **Golden Ratio** for section proportions (e.g., 60% content, 40% image).
   - **Whitespace**: "Luxury is whitespace". Double your margins. If you think \`py-12\` is enough, use \`py-24\`.

4. **TYPOGRAPHY**:
   - Use **Inter** or **Plus Jakarta Sans** (Google Fonts).
   - Hierarchy: H1 should be massive (text-5xl to text-7xl).
   - Readable text: max-width-prose (65 chars). text-base or text-lg for body.

5. **VISUALS**:
   - Shadows: Use meaningful elevation (\`shadow-xl\` for floating, \`shadow-sm\` for static).
   - Border Radius: Be consistent (either all \`rounded-xl\` or all \`rounded-none\` for brutalism).

# IMAGES & ASSETS STRATEGY (CRITICAL)
- **SOURCE**: Use Unsplash Source for high-quality stock photos.
- **SYNTAX**: \`https://source.unsplash.com/featured/{width}x{height}/?{keyword}&sig={random}\`
  - \`{width}x{height}\`: Adjust size (e.g., 1920x1080 for Hero, 800x600 for Cards).
  - \`{keyword}\`: English keywords (e.g., 'barber', 'haircut', 'tech', 'office').
  - \`&sig={random}\`: Append random number \`&sig=123\` to prevent duplicates.
- **ICONS**: Use FontAwesome 6 (CDN) or Lucide (SVG).
  - Example: \`<i class="fa-solid fa-arrow-right"></i>\`

# AGENT PROTOCOL
You must stream your process using this syntax:

:::LOG::: Analisando prompt...
:::PLAN::: 1. Header, 2. Hero...
:::THOUGHT::: "Usuario pediu moderno. Vou usar tipografia sans-serif bold e muito whitespace."
:::CODE_START:::
<!DOCTYPE html>...
:::CODE_END:::

# EXECUTION STEPS
1. **ANALYZE**: Read constraint & audience (Gen Z? Boomer? B2B?).
2. **PLAN**: Define sections. CHECK: "Am I using a generic layout? How can I make it asymmetrical or interesting?"
3. **EXECUTE**: Write the HTML/Tailwind.
   - **SELF-CORRECTION**: If you catch yourself writing \`bg-blue-600\`, stop. Change it to \`bg-slate-900\` or \`bg-orange-500\` unless blue is requested.
   - **COMPLETENESS**: Write every single line. No placeholders.

Start now.
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
