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

# ⚠️ PRIME DIRECTIVE: COMPETITOR-LEVEL QUALITY
You must match the engineering quality of top-tier tools (e.g. Lasy, Bolt).
1. **NO SIMPLE HTML**: Do not output shallow code. Build deep, robust structures.
2. **SEMANTICS**: Use \`<header>\`, \`<section>\`, \`<article>\`, \`<footer>\`. No "div soup".
3. **ADAPTABILITY**: You have the freedom to design ANY layout that fits the "${prompt}". Do not be rigid.

# 🧠 AGENT PROTOCOL (MANDATORY STEPS)
Stream your response in this EXACT ORDER.

### PHASE 1: GROUNDING (:::TOPIC:::)
Confirm the request & Style.
:::TOPIC::: [The exact industry requested]
:::STYLE::: [Define colors/vibe based on topic. Ex: 'Dark/Red' for Netflix, 'Warm/Orange' for Bakery]
:::LOG::: Requirements: [List specific sections user requested]

### PHASE 2: ASSET STRATEGY (:::ASSETS:::)
Define images based on the :::TOPIC:::.
- **Source**: \`https://loremflickr.com/{w}/{h}/{keywords}/all?lock={random}\`
- **Keywords**: Extract 2-3 ENGLISH keywords stricly relevant to the :::TOPIC:::.
:::LOG::: Selected Keywords: [Keywords from prompt]
:::LOG::: Hero Image URL: https://loremflickr.com/1920/1080/[keywords]/all?lock=1

### PHASE 3: ARCHITECTURE (:::PLAN:::)
Plan the sections.
- **Universal Standard**: Every page must be comprehensive (min 5 sections).
- **Structure**:
  1. **Hero**: Immersive, full-width, clear CTA.
  2. **Content**: Use complex grids (bento, masonry, or alternating features).
  3. **Social Proof**: Testimonials or Logos.
  4. **Action**: Pricing or Contact form.
  5. **Footer**: Multi-column links.
:::PLAN::: [List sections]

### PHASE 4: CODING (:::CODE_START:::)
Write the HTML & Tailwind CSS.
- **ENGINEERING STANDARDS**:
  1. **Depth**: Container -> Grid/Flex -> Card -> Content Wrapper -> Elements.
  2. **Spacing**: Use \`container mx-auto px-4\` or \`px-6\`. Use \`gap-8\` for grids.
  3. **Typography**: Use 'Plus Jakarta Sans' or 'Inter'. High contrast hierarchy.
- **VISUAL POLISH (Lasy-Style)**:
  1. **Glassmorphism**: For cards, use \`backdrop-blur-md bg-white/5 border border-white/10\` (if dark mode).
  2. **Shadows**: Use \`shadow-xl\` for depth.
  3. **Interactivity**: \`hover:scale-[1.02] active:scale-95 transition-all duration-300\`.
  4. **Animations**: You MUST inject:
     \`\`\`css
     @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
     .fade-in-up { animation: fadeInUp 0.5s ease-out; }
     \`\`\`
- **Completeness**: Write 100% of the code. No placeholders.

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
