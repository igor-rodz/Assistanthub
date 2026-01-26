import {
    getGeminiModel,
    requireAuth,
    checkSufficientCredits,
    deductCredits,
    uuidv4,
    getRequestBody,
    createResponse,
    createErrorResponse,
    corsHeaders,
    generateWithRetry
} from './_helpers.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders() });
    }

    try {
        const user = await requireAuth(request);
        const body = await getRequestBody(request);
        const { error_log, tags = [] } = body;

        if (!error_log) {
            throw { status: 400, message: "Missing 'error_log' field" };
        }

        const { hasCredits } = await checkSufficientCredits(user.id, 0.5);
        if (!hasCredits) {
            throw { status: 402, message: "Insufficient credits" };
        }

        const prompt = `
Você é um assistente de debugging. Analise este erro:

LOG: ${error_log.substring(0, 5000)}
TAGS: ${tags.join(', ')}

Responda APENAS JSON válido (sem markdown):
{
    "framework": "Nome do framework",
    "severity": "Alta|Média|Baixa",
    "root_cause": "Causa raiz resumida",
    "root_cause_description": "Explicação detalhada",
    "solution": "Solução passo a passo",
    "prompt": "Comando ou dica rápida"
}`;

        const model = await getGeminiModel();
        const result = await generateWithRetry(model, prompt);
        const response = await result.response;
        let text = response.text();

        // Clean JSON
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');

        let analysis;
        try {
            if (jsonStart > -1 && jsonEnd > -1) {
                analysis = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
            } else {
                throw new Error('No JSON found');
            }
        } catch {
            analysis = {
                framework: "Unknown",
                severity: "Média",
                root_cause: "Erro ao processar resposta da IA",
                root_cause_description: "A IA retornou formato inválido",
                solution: "Tente novamente com mais contexto",
                prompt: "N/A"
            };
        }

        const tokensIn = Math.ceil(prompt.length / 4);
        const tokensOut = Math.ceil(text.length / 4);
        const { remaining } = await deductCredits(
            user.id, 1.0, 'oneshot_fixes', 'Error Analysis', tokensIn, tokensOut
        );

        return createResponse({
            id: uuidv4(),
            log_id: `#${Date.now().toString(36).toUpperCase()}`,
            timestamp: new Date().toLocaleString(),
            ...analysis,
            credits_used: 1.0,
            credits_remaining: remaining
        });

    } catch (err) {
        return createErrorResponse(err);
    }
}
