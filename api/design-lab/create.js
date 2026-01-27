import {
    getGeminiModel,
    getSupabase,
    requireAuth,
    checkSufficientCredits,
    deductCredits,
    uuidv4,
    getRequestBody,
    createResponse,
    createErrorResponse,
    corsHeaders
} from '../_helpers.js';

// DesignLab Brain: Professional Design Generator (Lovable/Bolt-style)
// Focus: Quality, completeness, and strict adherence to user prompts
const CONST_GENERIC_DESIGN_DIRECTIVE = `
# ROLE
You are an expert UI/UX designer and front-end engineer. Your job is to create professional, production-ready designs that EXACTLY match what the user requests. Think like Lovable.dev or Bolt.new - you create complete, beautiful, functional designs.

# CORE PRINCIPLES
1. **OBEY THE USER'S PROMPT COMPLETELY**
   - If they ask for a dashboard → create a FULL dashboard with sidebar, charts, tables, navigation
   - If they ask for a button → create a beautiful, animated button component
   - If they ask for a landing page → create a COMPLETE landing page with hero, features, pricing, footer
   - If they ask for an animated card → create a card WITH animations
   - NEVER create something generic or incomplete. Always deliver EXACTLY what was requested.

2. **QUALITY OVER SPEED**
   - Take your time to think about the design before coding
   - Create complete, polished designs - not rushed wireframes
   - Every element should be properly styled and functional
   - Use professional spacing, typography, colors, and interactions

3. **COMPLETENESS**
   - If user asks for a "dashboard for a business" → include: sidebar nav, header, stat cards, charts, data tables, filters, actions
   - If user asks for a "landing page" → include: hero, features, testimonials, pricing, CTA, footer
   - If user asks for a "component" → make it production-ready with proper styling, hover states, animations if needed
   - NEVER leave placeholders like "[NOME]", "XX,XX", or generic "Lorem ipsum" in main content
   - Infer real content from the prompt context

# DESIGN STANDARDS
- Modern, clean aesthetic (like Dribbble top shots or premium SaaS products)
- Responsive design (mobile-first approach)
- Professional color schemes (dark mode preferred: bg-gray-900, bg-gray-800)
- Proper typography hierarchy (large headings, readable body text)
- Generous whitespace (py-16, py-20, px-4, px-6)
- Smooth interactions (hover effects, transitions)
- Tailwind CSS utility classes (preferred over custom CSS)

# TECHNICAL REQUIREMENTS
- Use Tailwind CDN: <script src="https://cdn.tailwindcss.com"></script>
- Semantic HTML5 structure
- Vanilla JavaScript for interactivity (if needed)
- Self-contained single HTML file
- Production-ready code (not prototypes or wireframes)

# CONTENT GUIDELINES
- Extract real content from user's prompt
- If they mention "barbershop" → use real barbershop names, services, prices
- If they mention "SaaS" → use appropriate SaaS terminology and features
- Create believable, contextual content - not generic placeholders
- Use images when they enhance the design (Unsplash URLs: https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&w=1600&q=80)

# OUTPUT EXPECTATIONS
- Complete, functional designs that work immediately when opened in a browser
- Professional quality that could be used in production
- Proper structure and organization
- Attention to detail in styling and interactions
`;

// export const config = { runtime: 'edge' }; // Disabled to allow longer timeouts with Node.js runtime

export default async function handler(request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders() });
    }

    try {
        const user = await requireAuth(request);
        const body = await getRequestBody(request);
        const { prompt, design_type = "component", fidelity = "high" } = body;

        if (!prompt) {
            throw { status: 400, message: "Missing 'prompt' field" };
        }

        const { hasCredits } = await checkSufficientCredits(user.id, 1.0);
        if (!hasCredits) {
            throw { status: 402, message: "Insufficient credits" };
        }

        // Construct the Super Prompt with explicit quality requirements
        const aiPrompt = `
${CONST_GENERIC_DESIGN_DIRECTIVE}

# TASK: CREATE A PROFESSIONAL DESIGN

**User's Request**: "${prompt}"
**Design Type**: ${design_type}
**Fidelity Level**: ${fidelity}

# YOUR MISSION
Create a COMPLETE, PROFESSIONAL design that EXACTLY fulfills the user's request above.

**CRITICAL REQUIREMENTS**:
1. Read the user's prompt carefully and create EXACTLY what they asked for
2. If they asked for a dashboard → build a FULL dashboard (not just one card)
3. If they asked for a landing page → build a COMPLETE landing page (not just hero)
4. If they asked for animations → include actual CSS/JS animations
5. Make it PRODUCTION-READY - polished, complete, beautiful
6. Use real content inferred from the prompt - no placeholders like "[NOME]" or "XX,XX"
7. Take your time - create something you'd be proud to show a client

# OUTPUT FORMAT
Respond ONLY with valid JSON (no markdown, no \`\`\`json wrapper).

{
    "explanation": "Brief 1-sentence explanation of what you created",
    "html": "<!DOCTYPE html>... complete HTML string with Tailwind CDN and any <script> needed ...",
    "css": "",
    "component_count": 1
}

# CODE REQUIREMENTS
- Single self-contained HTML file
- Tailwind CDN: <script src="https://cdn.tailwindcss.com"></script>
- GSAP for animations if needed: <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
- No React/Vue - pure HTML + Tailwind + vanilla JS only
- Complete, working code that opens perfectly in a browser

# REMEMBER
Quality over speed. Create something professional and complete. The user is counting on you to deliver exactly what they asked for.
`;

        const model = await getGeminiModel();

        // Configure generation for quality and completeness
        // Use generateContent with config for better quality output
        const generationConfig = {
            temperature: 0.7, // Balanced creativity vs consistency
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 4096, // Reduced to stay within Gemini's 16K output limit
        };

        // Create a new model instance with generation config
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY?.trim());
        const configuredModel = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            generationConfig: generationConfig
        });

        let result, response, text;
        try {
            result = await configuredModel.generateContent(aiPrompt);
            response = await result.response;
            text = response.text();
        } catch (genError) {
            console.error("Gemini Generation Error:", genError);
            // Check if it's a token limit error
            if (genError.message?.includes('max tokens') || genError.message?.includes('token limit')) {
                throw {
                    status: 400,
                    message: "O prompt é muito complexo. Tente simplificar a descrição ou divida em partes menores."
                };
            }
            throw {
                status: 500,
                message: `Erro ao gerar design: ${genError.message || 'Erro desconhecido'}`
            };
        }

        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');

        let designResult;
        try {
            if (jsonStart > -1 && jsonEnd > -1) {
                designResult = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError, "Raw Text:", text);
            designResult = {
                html: `<div style="color:red; pad:20px;"><h1>Generation Error</h1><p>Sorry, the AI brain malfunctioned. Please try again.</p><pre>${parseError.message}</pre></div>`,
                css: "",
                component_count: 0,
                explanation: "Parsing failure fallback."
            };
        }

        // Token/Cost Calculation
        const tokensIn = Math.ceil(aiPrompt.length / 4);
        const tokensOut = Math.ceil(text.length / 4);
        const fidelityMult = { "wireframe": 0.5, "medium": 1.0, "high": 2.0 }[fidelity] || 1.0;
        const creditCost = 0.5 * fidelityMult;

        const { remaining } = await deductCredits(
            user.id, creditCost, 'design_job', `Design: ${prompt.substring(0, 20)}`, tokensIn, tokensOut
        );

        const supabase = await getSupabase();
        const jobId = uuidv4();

        const jobData = {
            job_id: jobId,
            user_id: user.id,
            status: "complete",
            html: designResult.html,
            css: designResult.css || "", // CSS is embedded in HTML now, but keeping field for schema compat
            component_count: designResult.component_count || 1,
            prompt: prompt,
            tokens_input: tokensIn,
            tokens_output: tokensOut,
            credits_used: creditCost,
            credits_remaining: remaining,
            created_at: new Date().toISOString()
        };

        try {
            await supabase.from('design_jobs').insert(jobData);
        } catch (dbErr) {
            console.error("Failed to save design job:", dbErr);
        }

        return createResponse(jobData);

    } catch (err) {
        return createErrorResponse(err);
    }
}
