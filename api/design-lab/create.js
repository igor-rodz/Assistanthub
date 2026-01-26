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

export default async function handler(request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders() });
    }

    try {
        const user = await requireAuth(request);
        const body = await getRequestBody(request);
        const { prompt, design_type = "component", fidelity = "high" } = body;

        if (!prompt) throw { status: 400, message: "Prompt is required" };

        const { hasCredits } = await checkSufficientCredits(user.id, 1.0);
        if (!hasCredits) throw { status: 402, message: "Insufficient credits" };

        // Optimized Prompt for JSON stability
        const aiPrompt = `
Generate a modern, responsive HTML/CSS design.
Start Prompt: "${prompt}"
Type: ${design_type}
Fidelity: ${fidelity} (Use implementation-ready code)

Requirements:
- Use internal CSS in <style> tags (no external files).
- Modern clean aesthetics (box-shadows, rounded corners, good typography).
- Dark mode by default if not specified.

RESPONSE MUST BE VALID JSON ONLY:
{
    "html": "<div class='container'>...</div>",
    "css": ".container { ... }",
    "component_count": 1,
    "explanation": "Brief implementation logic"
}`;

        const model = await getGeminiModel();
        const result = await model.generateContent(aiPrompt);
        const response = await result.response;
        let text = response.text();

        // Safe JSON Parsing
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');

        let designResult;

        if (jsonStart > -1 && jsonEnd > -1) {
            try {
                designResult = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
            } catch (e) {
                // Fallback: try to deliver raw text if JSON fails, wrapped in safe structure
                designResult = {
                    html: `<!-- Error parsing AI JSON -->\n<div>${text}</div>`,
                    css: "",
                    component_count: 0
                };
            }
        } else {
            designResult = {
                html: `<!-- Invalid AI Response -->\n<div>${text}</div>`,
                css: "",
                component_count: 0
            };
        }

        // Logging & Credits
        const tokensIn = Math.ceil(aiPrompt.length / 4);
        const tokensOut = Math.ceil(text.length / 4);
        const fidelityMult = { "wireframe": 0.5, "medium": 1.0, "high": 2.0 }[fidelity] || 1.0;
        const creditCost = 0.5 * fidelityMult;

        const { remaining } = await deductCredits(
            user.id,
            creditCost,
            'design_job',
            `Design: ${prompt.substring(0, 20)}`,
            tokensIn,
            tokensOut
        );

        // Async DB Write (Validation: Awaiting it to ensure data integrity, but handled safe)
        const supabase = await getSupabase();
        const jobId = await uuidv4();

        const jobData = {
            job_id: jobId,
            user_id: user.id,
            status: "complete", // We serve it immediately (synchronous for now)
            html: designResult.html,
            css: designResult.css,
            component_count: designResult.component_count || 1,
            prompt: prompt,
            tokens_input: tokensIn,
            tokens_output: tokensOut,
            credits_used: creditCost,
            credits_remaining: remaining,
            created_at: new Date().toISOString()
        };

        // Fire & Forget DB insert to speed up response? 
        // Vercel might kill the process, so we MUST await it.
        // But we wrap in try/catch to not fail the request if DB log fails.
        try {
            await supabase.from('design_jobs').insert(jobData);
        } catch (dbErr) {
            console.error("Failed to save design job to DB:", dbErr);
        }

        return createResponse(jobData);

    } catch (err) {
        return createErrorResponse(err);
    }
}
