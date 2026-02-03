import {
    getGeminiModel,
    requireAuth,
    checkSufficientCredits,
    deductCredits,
    calculateCreditCost,
    uuidv4,
    getRequestBody,
    createResponse,
    createErrorResponse,
    corsHeaders,
    generateWithRetry
} from './_helpers.js';
import { getAgentContext, getSkillContext, routeError } from './_agent-loader.js';

export const config = { runtime: 'nodejs', maxDuration: 60 };

export default async function handler(request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders() });
    }

    try {
        const user = await requireAuth(request);
        const body = await getRequestBody(request);
        const { error_log, tags = [], image } = body;

        // Require at least error_log OR image
        if (!error_log && !image) {
            throw { status: 400, message: "Missing 'error_log' or 'image' field" };
        }

        // Pre-check: minimum cost is 6.5 credits base
        const minCost = 6.5;
        const { hasCredits, balance } = await checkSufficientCredits(user.id, minCost);
        if (!hasCredits) {
            throw {
                status: 402,
                message: `Créditos insuficientes. Você tem ${balance.toFixed(2)} créditos, mas precisa de pelo menos ${minCost} créditos.`
            };
        }

        // Agent Routing & Context Loading
        const { agent, skills } = routeError(error_log || '', tags);
        const agentContext = await getAgentContext(agent);

        let skillsContext = '';
        for (const skill of skills) {
            const content = await getSkillContext(skill);
            if (content) skillsContext += `\n\n--- SKILL: ${skill} ---\n${content}`;
        }

        // Build prompt based on input type
        let inputDescription = '';
        if (error_log && image) {
            inputDescription = 'O usuário enviou um log de erro E uma imagem/screenshot. Analise AMBOS.';
        } else if (image) {
            inputDescription = 'O usuário enviou uma imagem/screenshot de um erro. Analise a imagem.';
        } else {
            inputDescription = 'O usuário enviou um log de erro em texto.';
        }

        const promptText = `
[SYSTEM ROLE]
${agentContext || "Você é um assistente de debugging especialista."}

[KNOWLEDGE BASE]
${skillsContext}

[INSTRUCTIONS]
${inputDescription}
Analise este erro com base no seu papel e conhecimentos acima.
${error_log ? `LOG: ${error_log.substring(0, 5000)}` : ''}
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

        let result;

        // If image is provided, use multimodal generation
        if (image && image.data && image.mimeType) {
            console.log('[analyze-error] Processing with image:', image.mimeType);

            const imagePart = {
                inlineData: {
                    data: image.data,
                    mimeType: image.mimeType
                }
            };

            result = await generateWithRetry(model, [promptText, imagePart]);
        } else {
            result = await generateWithRetry(model, promptText);
        }

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

        // Calculate tokens (estimate image as ~258 tokens per image)
        const tokensIn = Math.ceil(promptText.length / 4) + (image ? 258 : 0);
        const tokensOut = Math.ceil(text.length / 4);

        // Dynamic cost: min 5 credits + 30% margin = min 6.5 credits
        const creditsToDeduct = calculateCreditCost(tokensIn, tokensOut, !!image);

        const { remaining } = await deductCredits(
            user.id,
            creditsToDeduct,
            'oneshot_fixes',
            image ? 'Error Analysis (with image)' : 'Error Analysis',
            tokensIn,
            tokensOut
        );

        // [NEW] Save detailed history to 'analysis_history' table
        try {
            const supabase = await getSupabase(true); // Admin client
            await supabase.from('analysis_history').insert({
                user_id: user.id,
                prompt_content: error_log || (image ? '[Image Only Error]' : '[No Content]'),
                full_log: error_log, // Store full log if available
                analysis_result: analysis, // Store the JSON result
                metadata: {
                    tokens_input: tokensIn,
                    tokens_output: tokensOut,
                    model: 'gemini-2.5-flash',
                    credits_cost: creditsToDeduct,
                    tags: tags,
                    has_image: !!image
                }
            });
            console.log('[analyze-error] History saved successfully');
        } catch (histError) {
            console.error('[analyze-error] Failed to save history:', histError);
            // Non-blocking error
        }

        return createResponse({
            id: uuidv4(),
            log_id: `#${Date.now().toString(36).toUpperCase()}`,
            timestamp: new Date().toLocaleString('pt-BR'),
            ...analysis,
            tokens_input: tokensIn,
            tokens_output: tokensOut,
            tokens_total: tokensIn + tokensOut,
            credits_used: creditsToDeduct,
            credits_remaining: remaining,
            had_image: !!image,
            processing_time: '~2s'
        });

    } catch (err) {
        return createErrorResponse(err);
    }
}
