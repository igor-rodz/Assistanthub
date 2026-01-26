import { getGeminiModel, requireAuth, checkSufficientCredits, deductCredits, uuidv4, getRequestBody } from './_helpers.js';

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
        const { error_log, tags = [] } = body;

        console.log('[Analyze Error] Iniciando análise para usuário:', user.id);
        console.log('[Analyze Error] Log recebido:', error_log?.substring(0, 100) + '...');

        const { hasCredits } = await checkSufficientCredits(user.id, 0.5);
        if (!hasCredits) {
            return new Response(JSON.stringify({ detail: "Créditos insuficientes" }), {
                status: 402,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        const aiPrompt = `
Você é o Lasy Fixer Pro. Analise:
LOG: ${error_log}
TAGS: ${tags.join(', ')}
Responda APENAS JSON:
{
    "framework": "...",
    "severity": "Alta/Média/Baixa",
    "root_cause": "...",
    "root_cause_description": "...",
    "solution": "...",
    "prompt": "..."
}
    `;

        console.log('[Analyze Error] Chamando Gemini API...');
        const model = await getGeminiModel();
        const result = await model.generateContent(aiPrompt);
        const response = await result.response;
        let text = response.text();
        console.log('[Analyze Error] Resposta recebida (primeiros 200 chars):', text.substring(0, 200));

        // Clean up response text
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let analysis;
        try {
            analysis = JSON.parse(text);
            console.log('[Analyze Error] JSON parseado com sucesso');
        } catch (e) {
            console.log('[Analyze Error] Erro no parse inicial, tentando extrair JSON...');
            console.log('[Analyze Error] Texto completo:', text);

            const match = text.match(/\{[\s\S]*\}/);
            if (match) {
                try {
                    analysis = JSON.parse(match[0]);
                    console.log('[Analyze Error] JSON extraído e parseado com sucesso');
                } catch (parseErr) {
                    console.error('[Analyze Error] Erro ao parsear JSON extraído:', parseErr.message);
                    throw new Error(`Erro ao parsear JSON: ${parseErr.message}. Resposta do Gemini: ${text.substring(0, 500)}`);
                }
            } else {
                throw new Error(`Nenhum JSON encontrado na resposta do Gemini. Resposta: ${text.substring(0, 500)}`);
            }
        }

        // Validate required fields
        if (!analysis.framework || !analysis.root_cause || !analysis.solution) {
            console.warn('[Analyze Error] Campos faltando no JSON:', analysis);
        }

        // Calculate Token/Credits
        const tokensIn = aiPrompt.split(/\s+/).length * 2;
        const tokensOut = text.split(/\s+/).length * 2;
        const creditCost = 1.0;

        console.log('[Analyze Error] Deduzindo créditos...');
        const { remaining } = await deductCredits(user.id, creditCost, 'oneshot_fixes', 'Error Analysis', tokensIn, tokensOut);

        const responseData = {
            id: await uuidv4(),
            log_id: `#${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${(await uuidv4()).substring(0, 4).toUpperCase()}`,
            timestamp: new Date().toLocaleString(),
            framework: analysis.framework || "ND",
            severity: analysis.severity || "Média",
            tokens_input: tokensIn,
            tokens_output: tokensOut,
            tokens_total: tokensIn + tokensOut,
            credits_used: creditCost,
            credits_remaining: remaining,
            processing_time: "1.0s",
            root_cause: analysis.root_cause || "Não identificado",
            root_cause_description: analysis.root_cause_description || analysis.root_cause || "Não identificado",
            solution: analysis.solution || "Não disponível",
            prompt: analysis.prompt || "Não disponível"
        };

        console.log('[Analyze Error] Análise concluída com sucesso');
        return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });

    } catch (err) {
        console.error("[Analyze Error] Erro completo:", err);
        const status = err.status || 500;
        const message = err.message || "Erro desconhecido";
        return new Response(JSON.stringify({
            detail: "Erro ao analisar erro: " + message
        }), {
            status: status,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}
