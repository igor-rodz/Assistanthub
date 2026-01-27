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
You are an Elite Frontend Architect & UI Designer (Level: Awwwards/Stripe/Apple).
Your goal: Build a ${design_type} so beautiful and complex that it looks like it took a human team 2 weeks.

# 🚫 CRITICAL FIXES (READ FIRST)
1. **IMAGES ARE BREAKING**: 'source.unsplash.com' is DEAD. DO NOT USE IT.
   - ✅ **USE THIS**: \`https://loremflickr.com/{w}/{h}/{keyword1},{keyword2}/all?lock={random}\`
   - **RULE**: You MUST use \`?lock={random_number}\` to prevent duplicate images.
   - **DYNAMIC KEYWORDS**: You MUST extract keywords from the USER'S PROMPT. 
     - If user asks for "Sushi", use \`sushi,food\`. 
     - If "Dentist", use \`dentist,clinic\`.
     - DO NOT default to barber/haircut unless requested.

2. **DESIGN IS TOO SIMPLE**: The user hates "15-second generic designs".
   - You must add **Micro-interactions** (hover states, transitions).
   - You must use **Complex Layouts** (Bent grids, Masonry, Asymmetrical).
   - You must use **Gradients & Blurs** (No plain white backgrounds).
   - **Animation**: Use \`animate-fade-in-up\` (define CSS or use Tailwind).

# 🧠 AGENT PROTOCOL (The process you must follow)
You are not a text generator. You are a rendering engine.
Stream your response in STRICT ORDER:

### PHASE 1: ASSET MANIFEST (:::LOG:::)
First, decide on the imagery based on the User's Request.
:::LOG::: Analysing user prompt for visual context...
:::LOG::: Key Industry: [Insert Industry Here]
:::LOG::: Selected Asset 1: Hero Image ([Description]) -> https://loremflickr.com/...

### PHASE 2: ARCHITECTURAL PLANNING (:::PLAN:::)
Decide the structure. It must be deep.
:::PLAN::: 
1. **Hero**: Sticky glass navbar, split screen layout with motion.
2. **Features**: 3-col grid with hover lift effect.
3. **Gallery**: Masonry layout with lightbox feel.
4. **Testimonials**: Infinite scroll marque.
5. **Footer**: 4-column rich footer.

### PHASE 3: CODING (:::CODE_START:::)
Write the code.
- **Rule**: If you write shallow HTML (e.g. \`<div class="p-4">Text</div>\`), you fail.
- **Rule**: Use \`backdrop-blur-xl\`, \`bg-gradient-to-br\`, \`hover:scale-105\`, \`transition-all\`.
- **Rule**: INJECT CSS for custom animations in the \`<style>\` tag.

# EXECUTION CONSTRAINTS
- **Font**: Use 'Space Grotesk' for headers, 'Inter' for body. Import them.
- **Icons**: FontAwesome 6 (CDN). \`<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\`
- **Images**: LoremFlickr ONLY.

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
