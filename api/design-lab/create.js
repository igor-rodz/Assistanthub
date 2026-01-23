const { getGeminiModel, getSupabase, requireAuth, checkSufficientCredits, deductCredits, uuidv4 } = require('../_helpers');

module.exports = async (req, res) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).json({});
    }

    try {
        const user = await requireAuth(req);
        const { prompt, design_type = "component", fidelity = "high" } = req.body;

        const { hasCredits } = await checkSufficientCredits(user.id, 1.0);
        if (!hasCredits) {
            return res.status(402).json({ detail: "Créditos insuficientes" });
        }

        const aiPrompt = `
Crie HTML/CSS para: ${prompt}
Design: ${design_type}, Fidelidade: ${fidelity}
Regras: CSS moderno, tema escuro, responsivo.
Responda JSON: { "html": "...", "css": "...", "component_count": 5 }
    `;

        const model = getGeminiModel();
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

        const supabase = getSupabase();
        const jobId = uuidv4();
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

        return res.json(jobData);

    } catch (err) {
        console.error("Design Lab Error:", err);
        if (err.status) {
            return res.status(err.status).json({ detail: err.message });
        }
        return res.status(500).json({ detail: "Erro ao gerar design: " + err.message });
    }
};
