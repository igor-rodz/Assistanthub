import { getGeminiModel, getSupabase, requireAuth, checkSufficientCredits, deductCredits, uuidv4, getRequestBody } from '../_helpers.js';

export default async function handler(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        });
    }

    try {
        const user = await requireAuth(request);
        const body = await getRequestBody(request);
        const { prompt, design_type = "component", fidelity = "high" } = body;

        const { hasCredits } = await checkSufficientCredits(user.id, 1.0);
        if (!hasCredits) {
            return new Response(JSON.stringify({ detail: "Créditos insuficientes" }), {
                status: 402,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        const aiPrompt = `
Crie HTML/CSS para: ${prompt}
Design: ${design_type}, Fidelidade: ${fidelity}
Regras: CSS moderno, tema escuro, responsivo.
Responda JSON: { "html": "...", "css": "...", "component_count": 5 }
    `;

        const model = await getGeminiModel();
        const result = await model.generateContent(aiPrompt);
        const response = await result.response;
        let text = response.text();

        // Parse JSON
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        let designResult;
        try {
            designResult = JSON.parse(text);
        } catch (e) {
            const match = text.match(/\{[\s\S]*\}/);
            if (match) {
                designResult = JSON.parse(match[0]);
            } else {
                throw new Error("Could not parse JSON response");
            }
        }

        // Calculate Token/Credits
        const tokensIn = aiPrompt.split(/\s+/).length * 2;
        const tokensOut = text.split(/\s+/).length * 2;

        const fidelityMult = { "wireframe": 0.5, "medium": 1.0, "high": 2.0 }[fidelity] || 1.0;
        const comps = designResult.component_count || 1;
        const creditCost = 0.5 * fidelityMult;

        const { remaining } = await deductCredits(user.id, creditCost, 'design_job', `Design: ${prompt.substring(0, 20)}`, tokensIn, tokensOut);

        const supabase = await getSupabase();
        const jobId = await uuidv4();
        const jobData = {
            job_id: jobId,
            user_id: user.id,
            status: "complete",
            html: designResult.html,
            css: designResult.css,
            component_count: comps,
            prompt: prompt,
            tokens_input: tokensIn,
            tokens_output: tokensOut,
            credits_used: creditCost,
            credits_remaining: remaining,
            created_at: new Date().toISOString()
        };

        await supabase.from('design_jobs').insert(jobData);

        return new Response(JSON.stringify(jobData), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });

    } catch (err) {
        console.error("Design Lab Error:", err);
        const status = err.status || 500;
        const message = err.message || "Erro desconhecido";
        return new Response(JSON.stringify({ detail: "Erro ao gerar design: " + message }), {
            status: status,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}
