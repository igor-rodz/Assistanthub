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

# AGENT PROTOCOL (STRICT)
You must stream your process in a specific format defined below.
Do not just output HTML. You must THINK, PLAN, and EXECUTE step-by-step.

# IMAGES & ASSETS STRATEGY (CRITICAL)
- **DO NOT GENERATE AI IMAGES**. The user wants professional, REAL photos.
- **SOURCE**: Use Unsplash Source for high-quality stock photos.
- **SYNTAX**: \`https://source.unsplash.com/featured/{width}x{height}/?{keyword}&sig={random}\`
  - \`{width}x{height}\`: Adjust size to fit the container (e.g., 1920x1080 for Hero, 400x400 for avatars, 800x600 for reliable standard).
  - \`{keyword}\`: Use specific ENGLISH keywords representing the image content (e.g., 'barber', 'haircut', 'technology', 'meeting', 'sushi').
  - \`&sig={random}\`: You MUST append a random integer (e.g. \`&sig=123\`) to EVERY URL to prevent the browser from showing the exact same image for different sections.
  
- **ICONS**: Use Lucide-React classes if likely available, or FontAwesome via CDN. PREFER SVG icons inline for maximum control if you are writing raw HTML.
  - Recommended: \`<i class="fa-solid fa-scissors"></i>\` (FontAwesome 6 CDN).

# THOUGHT PROCESS (REAL-TIME LOGS)
- When you need an image, LOG it: ":::LOG::: Buscando imagem profissional de '{keyword}' no Unsplash..."
- When you plan the layout, LOG it: ":::PLAN::: Definindo grade de serviços com fotos reais..."

# OUTPUT FORMAT
You will output a stream of strictly formatted JSON-like lines (or blocks).
To make it easy to parse, separate your "Thoughts" from your "Code".

Structure your response in this order:
1. **PLANNING**:
   - Analisar requisitos.
   - Definir estrutura (Header, Hero, Sections, Footer).
   - Verificar necessidades de assets (imagens, ícones).
   - Output logs: "Thought: Analisando...", "Plan: Estrutura definida..."

2. **EXECUTION**:
   - Escrever HTML. "Action: Escrevendo Header..."
   - Escrever CSS (Tailwind).
   - AUTO-CORRECTION: Se o prompt pedir carrossel e você esqueceu, PARE, pense "Erro: Esqueci o carrossel", e adicione.

3. **FINAL_OUTPUT**:
   - The final JSON with the code.

# STREAMING SYNTAX
Use this specific syntax for the stream so the frontend can parse "events":

:::LOG::: Analisando prompt do usuário...
:::LOG::: Definindo paleta de cores e tipografia...
:::PLAN::: 1. Header Sticky, 2. Hero com CTA, 3. Galeria (Grid), 4. FAQ...
:::LOG::: Buscando imagens de alta resolução para {prompt}...
:::LOG::: Gerando código HTML estrutural...
:::CODE_START:::
<!DOCTYPE html>...
:::CODE_END:::

# CRITICAL RULES
- **COMPLETENESS**: Never output "<!-- rest of code -->". Wrive EVERY SINGLE LINE.
- **IMAGES**: Use \`https://image.pollinations.ai/prompt/description%20of%20image\` for every image source. Replace spaces in description with %20. Example: \`https://image.pollinations.ai/prompt/barber%20cutting%20hair%20cinematic\`
- **TAILWIND**: Use Tailwind CSS via CDN.
- **ICONS**: Use FontAwesome or Lucide (via CDN/SVG).

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
