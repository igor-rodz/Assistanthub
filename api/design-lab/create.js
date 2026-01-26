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

        const aiPrompt = `
Crie um design HTML/CSS moderno e responsivo.

Prompt: "${prompt}"
Tipo: ${design_type}
Fidelidade: ${fidelity}

Requisitos:
- CSS interno em <style>
- Design moderno (sombras, gradientes, tipografia)
- Dark mode por padrão
- Responsivo

Responda APENAS JSON válido (sem markdown):
{
    "html": "<div>...</div>",
    "css": ".container { ... }",
    "component_count": 1
}`;

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
                throw new Error('No JSON');
            }
        } catch {
            designResult = {
                html: `<div class="error">Erro ao gerar design. Tente novamente.</div>`,
                css: ".error { color: red; padding: 20px; }",
                component_count: 0
            };
        }

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
            css: designResult.css,
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
