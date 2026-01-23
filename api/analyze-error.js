const { getGeminiModel, requireAuth, checkSufficientCredits, deductCredits, uuidv4, getRequestBody } = require('./_helpers');

module.exports = {
    async fetch(request) {
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
            console.log('[Analyze Error] Request method:', request.method);
            console.log('[Analyze Error] Request URL:', request.url);
            
            // Validate request method
            if (request.method !== 'POST') {
                return new Response(JSON.stringify({ detail: "Method not allowed" }), {
                    status: 405,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                });
            }

            // Get body first
            let body;
            try {
                body = await getRequestBody(request);
                console.log('[Analyze Error] Body recebido:', JSON.stringify(body).substring(0, 200));
            } catch (bodyErr) {
                console.error('[Analyze Error] Erro ao parsear body:', bodyErr);
                return new Response(JSON.stringify({ detail: "Invalid request body" }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                });
            }

            const { error_log, tags = [] } = body;

            if (!error_log) {
                return new Response(JSON.stringify({ detail: "error_log is required" }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                });
            }

            // Auth
            let user;
            try {
                user = await requireAuth(request);
                console.log('[Analyze Error] Usuário autenticado:', user.id);
            } catch (authErr) {
                console.error('[Analyze Error] Erro de autenticação:', authErr);
                const status = authErr.status || 401;
                return new Response(JSON.stringify({ detail: authErr.message || "Authentication failed" }), {
                    status: status,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                });
            }

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
            let model;
            try {
                model = getGeminiModel();
                console.log('[Analyze Error] Modelo Gemini obtido com sucesso');
            } catch (modelErr) {
                console.error('[Analyze Error] Erro ao obter modelo Gemini:', modelErr);
                throw new Error('Erro ao inicializar modelo Gemini: ' + modelErr.message);
            }

            let result, response, text;
            try {
                result = await model.generateContent(aiPrompt);
                response = await result.response;
                text = response.text();
                console.log('[Analyze Error] Resposta recebida (primeiros 200 chars):', text.substring(0, 200));
            } catch (geminiErr) {
                console.error('[Analyze Error] Erro ao chamar Gemini:', geminiErr);
                throw new Error('Erro ao gerar conteúdo com Gemini: ' + geminiErr.message);
            }

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
                id: uuidv4(),
                log_id: `#${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${uuidv4().substring(0, 4).toUpperCase()}`,
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
            console.error("[Analyze Error] Stack:", err.stack);
            console.error("[Analyze Error] Tipo do erro:", typeof err);
            console.error("[Analyze Error] Erro stringificado:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
            
            const status = err.status || 500;
            let message = "Erro desconhecido";
            
            if (err.message) {
                message = err.message;
            } else if (typeof err === 'string') {
                message = err;
            } else if (err.toString) {
                message = err.toString();
            }

            // Don't expose internal errors in production
            const errorDetail = process.env.NODE_ENV === 'production' 
                ? "Erro interno do servidor. Verifique os logs."
                : `Erro ao analisar erro: ${message}`;

            return new Response(JSON.stringify({ 
                detail: errorDetail,
                error: process.env.NODE_ENV !== 'production' ? message : undefined
            }), {
                status: status,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }
    }
};
