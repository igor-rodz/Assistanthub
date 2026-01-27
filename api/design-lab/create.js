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

// Synthesized Design Brain: Frontend Specialist + Motion Intelligence
// Generic Design Directive (Standard Mode)
const CONST_GENERIC_DESIGN_DIRECTIVE = `
# ROLE: Expert Web Designer
You are an expert web designer capable of creating beautiful, functional, and responsive web interfaces.

# GOAL
Create a high-quality web page or component based on the user's request.
Ensure the design looks professional, modern, and is fully responsive (mobile-first).

# INSTRUCTIONS
1. **Visual Style**: Use modern aesthetics (clean, proper whitespace, good typography).
2. **Components**:
   - If a Carousel/Slider is requested, ensure it works horizontally.
   - If Images are needed, use placeholder images (e.g. valid Lorem Picsum or Placehold.co URLs).
   - Do not leave empty boxes. Fill them with example content.
3. **Tech Stack**:
   - Use Tailwind CSS for all styling.
   - Use semantic HTML5.
   - If interactivity is needed, use vanilla JavaScript.

# OUTPUT RULES
- Fully functional HTML/CSS/JS in a single file.
- No external CSS files (use <style> or Tailwind classes).
- No external JS files (use <script>).
`;

export const config = { runtime: 'edge' };

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

        // Construct the Super Prompt
        const aiPrompt = `
${CONST_GENERIC_DESIGN_DIRECTIVE}

# TASK: Generate a specific design based on the user request.

**User Request**: "${prompt}"
**Type**: ${design_type}
**Fidelity**: ${fidelity}

**OUTPUT FORMAT**:
Respond APENAS com JSON válido (sem markdown, sem \`\`\`json).
O JSON deve seguir esta estrutura estrita:
{
    "explanation": "Brief 1-sentence design rationale (e.g. 'Chose Acid Green brutalism to allow high contrast...')",
    "html": "<!DOCTYPE html>... full html string with embedded <style> and <script> ...",
    "component_count": 1
}

**CODE REQUIREMENTS**:
1. Single HTML file containing all Styles (<style>) and Scripts (<script>).
2. Use Tailwind via CDN: <script src="https://cdn.tailwindcss.com"></script>
3. Include GSAP/ScrollTrigger via CDN if needed: <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
4. Include FontAwesome or Lucide Icons via CDN if needed.
`;

        const model = await getGeminiModel();
        const result = await model.generateContent(aiPrompt);
        const response = await result.response;
        let text = response.text();

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
