import {
    getGeminiModel,
    requireAuth,
    checkSufficientCredits,
    deductCredits,
    uuidv4,
    getRequestBody,
    createResponse,
    createErrorResponse,
    corsHeaders
} from './_helpers.js';

export default async function handler(request) {
    // 1. Handle CORS Preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders() });
    }

    try {
        // 2. Auth & Input
        const user = await requireAuth(request);
        const body = await getRequestBody(request);
        const { error_log, tags = [] } = body;

        if (!error_log) {
            throw { status: 400, message: "Missing 'error_log' in request body" };
        }

        console.log(`[Analyze Error] Start for User: ${user.id}`);

        // 3. Credit Check
        const { hasCredits } = await checkSufficientCredits(user.id, 0.5);
        if (!hasCredits) {
            throw { status: 402, message: "Insufficient credits" };
        }

        // 4. AI Generation
        const aiPrompt = `
Você é o Lasy Fixer Pro. Analise ste erro de programação.
LOG: ${error_log.substring(0, 5000)} 
TAGS: ${tags.join(', ')}

Responda APENAS um JSON válido (sem markdown code blocks) com este formato exato:
{
    "framework": "Nome do Framework/Lib",
    "severity": "Alta" | "Média" | "Baixa",
    "root_cause": "Explicação técnica curta da causa raiz",
    "root_cause_description": "Explicação detalhada para o desenvolvedor",
    "solution": "Passo a passo para corrigir",
    "prompt": "Um comando ou dica rápida relacionada",
    "corrected_code": "Snippet de código corrigido se aplicável (opcional)"
}`;

        const model = await getGeminiModel();

        // Timeout handling is implicit via Vercel, but good to wrap if we had custom helper
        const result = await model.generateContent(aiPrompt);
        const response = await result.response;
        let text = response.text();

        // 5. Clean & Parse JSON
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Enforce JSON start/end if Gemini chatters
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            text = text.substring(jsonStart, jsonEnd + 1);
        }

        let analysis;
        try {
            analysis = JSON.parse(text);
        } catch (e) {
            console.error("[Analyze Error] JSON Parse Failed:", text);
            // Fallback object instead of crash
            analysis = {
                framework: "Desconhecido",
                severity: "Média",
                root_cause: "Erro ao processar resposta da IA",
                root_cause_description: "A IA retornou um formato inválido. Tente novamente.",
                solution: "Não foi possível gerar uma solução automática no momento.",
                prompt: "Tente reenviar com mais contexto."
            };
        }

        // 6. Deduct Credits & Log
        const tokensIn = aiPrompt.length / 4; // Estimate
        const tokensOut = text.length / 4;
        const creditCost = 1.0;

        const { remaining } = await deductCredits(
            user.id,
            creditCost,
            'oneshot_fixes',
            `Analysis: ${analysis.framework}`,
            Math.ceil(tokensIn),
            Math.ceil(tokensOut)
        );

        // 7. Response
        const responseData = {
            id: await uuidv4(),
            log_id: `#${Date.now().toString(36).toUpperCase()}`,
            timestamp: new Date().toLocaleString(),
            ...analysis,
            credits_used: creditCost,
            credits_remaining: remaining
        };

        return createResponse(responseData);

    } catch (err) {
        return createErrorResponse(err);
    }
}
