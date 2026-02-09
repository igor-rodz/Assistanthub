import {
    getSupabase,
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
import { routeError } from './_agent-router.js'; // Use edge-safe router

// Switch to Edge Runtime to handle longer timeouts (Gemini wait time)
export const config = { runtime: 'edge' };

const MAX_ERROR_LOG_CHARS = 25000; // Increased because valid logs can be large

function normalizeSeverity(severity) {
    const s = String(severity || '').trim().toLowerCase();
    if (s === 'alta' || s === 'high') return 'Alta';
    if (s === 'baixa' || s === 'low') return 'Baixa';
    if (s === 'média' || s === 'media' || s === 'medium') return 'Média';
    return 'Média';
}

function normalizeAnalysis(raw) {
    const obj = (raw && typeof raw === 'object') ? raw : {};
    const framework = typeof obj.framework === 'string' ? obj.framework.trim() : 'Unknown';
    const rootCause = typeof obj.root_cause === 'string' ? obj.root_cause.trim() : 'Unknown';
    const rootCauseDescription = typeof obj.root_cause_description === 'string' ? obj.root_cause_description.trim() : '';
    const solution = typeof obj.solution === 'string' ? obj.solution.trim() : '';
    const prompt = typeof obj.prompt === 'string' ? obj.prompt.trim() : '';
    const reasoning = typeof obj.reasoning === 'string' ? obj.reasoning.trim() : '';

    return {
        framework: framework || 'Unknown',
        severity: normalizeSeverity(obj.severity),
        root_cause: rootCause || 'Unknown',
        root_cause_description: rootCauseDescription || 'Unknown',
        solution: solution || 'Unknown',
        prompt: prompt || 'Unknown',
        reasoning: reasoning
    };
}

function getSystemRoleFromRoute(agent) {
    if (agent === 'backend-specialist') {
        return 'Você é um assistente de debugging de BACKEND/APIs. Foque em HTTP status codes, CORS, validação, autenticação, payload size, logs do servidor e integração com banco/Supabase. Respostas devem ser curtas e acionáveis.';
    }
    if (agent === 'frontend-specialist') {
        return 'Você é um assistente de debugging de FRONTEND. Foque em runtime errors do navegador, React, hydration, bundlers, requests no cliente, CORS e variáveis de ambiente. Respostas devem ser curtas e acionáveis.';
    }
    if (agent === 'devops-engineer') {
        return 'Você é um assistente de debugging de DEPLOY/DEVOPS. Foque em build logs, env vars, limites de plataforma, configuração de runtime e etapas de deploy. Respostas devem ser curtas e acionáveis.';
    }
    return 'Você é um assistente de debugging extremamente objetivo e preciso. Respostas devem ser curtas e acionáveis.';
}

// Helper function para extrair campos manualmente de respostas quebradas
function extractFieldsManually(text) {
    const result = {
        framework: "Unknown",
        severity: "Média",
        root_cause: "Não identificado",
        root_cause_description: "Não foi possível extrair",
        solution: "Tente novamente",
        prompt: "N/A"
    };

    try {
        // Extrai framework
        const frameworkMatch = text.match(/"framework":\s*"([^"]+)"/i);
        if (frameworkMatch) result.framework = frameworkMatch[1];

        // Extrai severity
        const severityMatch = text.match(/"severity":\s*"([^"]+)"/i);
        if (severityMatch) result.severity = severityMatch[1];

        // Extrai root_cause
        const rootCauseMatch = text.match(/"root_cause":\s*"([^"]+)"/i);
        if (rootCauseMatch) result.root_cause = rootCauseMatch[1];

        // Extrai root_cause_description
        const descMatch = text.match(/"root_cause_description":\s*"([^"]+)"/i);
        if (descMatch) result.root_cause_description = descMatch[1];

        // Extrai solution
        const solutionMatch = text.match(/"solution":\s*"([^"]+)"/i);
        if (solutionMatch) result.solution = solutionMatch[1];

        // Extrai prompt (pode ser longo)
        const promptMatch = text.match(/"prompt":\s*"([^"]*(?:\\.[^"]*)*)"/i);
        if (promptMatch) {
            result.prompt = promptMatch[1]
                .replace(/\\n/g, '\n')
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\');
        }

        console.log('[extractFieldsManually] Extracted fields:', {
            framework: result.framework,
            severity: result.severity,
            root_cause: result.root_cause
        });
    } catch (err) {
        console.error('[extractFieldsManually] Extraction failed:', err.message);
    }

    return result;
}

export default async function POST(request) {
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
                message: 'Créditos insuficientes para realizar esta análise.',
                noCredits: balance === 0,
                currentBalance: balance
            };
        }

        // Agent Routing (used only to pick a short system role; we do NOT inject markdown files)
        const { agent } = routeError(error_log || '', tags);
        const systemRole = getSystemRoleFromRoute(agent);

        // Build prompt based on input type
        let inputDescription = '';
        if (error_log && image) {
            inputDescription = 'O usuário enviou um log de erro E uma imagem/screenshot. Analise AMBOS.';
        } else if (image) {
            inputDescription = 'O usuário enviou uma imagem/screenshot de um erro. Analise a imagem.';
        } else {
            inputDescription = 'O usuário enviou um log de erro em texto.';
        }

        const safeErrorLog = (error_log || '').slice(0, MAX_ERROR_LOG_CHARS);
        const promptText = `
[SYSTEM]
${systemRole}

[TASK]
${inputDescription}

REGRAS OBRIGATÓRIAS:
1) Use SOMENTE evidências do LOG/IMAGEM. Se não sabe, assuma "Unknown".
2) O campo "reasoning" (raciocínio) é OBRIGATÓRIO. Use-o para explicar passo-a-passo o que você encontrou antes de preencher os outros campos.
3) O campo "prompt" deve ser COMPLETO, DETALHADO e PRONTO PARA USO.
4) Formato JSON estrito.

[INPUT]
TAGS: ${tags.join(', ')}
LOG (pode estar vazio se houver imagem):
${safeErrorLog}

[OUTPUT]
Retorne APENAS um JSON válido (sem markdown, sem texto fora do JSON) no formato exato.
NÃO inclua comentários, NÃO inclua texto antes/depois. Somente o objeto JSON.
{
  "reasoning": "string (Analise o erro passo a passo aqui...)",
  "framework": "string",
  "severity": "Alta|Média|Baixa",
  "root_cause": "string",
  "root_cause_description": "string",
  "solution": "string",
  "prompt": "string"
}

CONTEÚDO DO CAMPO "prompt":
- Deve começar com um título curto (1 linha)
- Deve ter uma seção "EVIDENCE" citando 1-3 trechos do LOG (ou texto lido da imagem)
- Deve ter uma seção "FIX PLAN" com passos numerados
- Deve incluir diffs/patches em blocos de código quando apropriado
- Seja o MAIS CURTO possível sem perder precisão.
- Regra prática: ~20-40 linhas na maioria dos casos.
- Só use 40-80 linhas quando o erro exigir (múltiplos arquivos/causas ou patch mais complexo).
- Se não der para fechar com segurança, peça exatamente 1 informação faltante.
`;

        const model = await getGeminiModel();

        let result;
        let text = '';
        let analysisSuccess = false;
        let analysis = {
            framework: "Unknown",
            severity: "Média",
            root_cause: "Falha na geração da análise",
            root_cause_description: "Não foi possível processar a solicitação",
            solution: "Tente novamente com um log mais claro",
            prompt: "N/A"
        };

        try {
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
            text = response.text();

            console.log('[analyze-error] Raw Gemini response:', text);

            // Clean JSON
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonStart = text.indexOf('{');
            const jsonEnd = text.lastIndexOf('}');

            // Tenta reparar JSON truncado ou fragmentado
            let jsonText = '';
            if (jsonStart > -1 && jsonEnd > -1 && text.length > 50) {
                jsonText = text.substring(jsonStart, jsonEnd + 1);

                try {
                    // Verifica se o JSON está truncado (contagem de chaves)
                    const openBraces = (jsonText.match(/\{/g) || []).length;
                    const closeBraces = (jsonText.match(/\}/g) || []).length;

                    if (openBraces > closeBraces) {
                        // Adiciona as chaves faltantes
                        const missingBraces = openBraces - closeBraces;
                        jsonText += '}'.repeat(missingBraces);
                        console.log('[analyze-error] Fixed truncated JSON, added', missingBraces, 'closing braces');
                    }

                    // Tenta fazer parse
                    const parsed = JSON.parse(jsonText);
                    analysis = normalizeAnalysis(parsed);
                    analysisSuccess = true;
                    console.log('[analyze-error] Analysis successful');
                } catch (parseError) {
                    console.error('[analyze-error] JSON parse failed:', parseError.message);
                    console.error('[analyze-error] Attempted JSON:', jsonText.substring(0, 300) + '...');

                    // Fallback: extrai campos manualmente se JSON estiver muito quebrado
                    analysis = extractFieldsManually(text);
                    if (analysis.framework !== "Unknown") {
                        analysisSuccess = true;
                        console.log('[analyze-error] Manual extraction successful');
                    } else {
                        throw new Error('JSON parse failed and manual extraction failed');
                    }
                }
            } else {
                console.error('[analyze-error] No valid JSON found in response');
                console.error('[analyze-error] Raw response length:', text.length);
                console.error('[analyze-error] Raw response preview:', text.substring(0, 200) + '...');

                // Último recurso: extração manual
                analysis = extractFieldsManually(text);
                if (analysis.framework !== "Unknown") {
                    analysisSuccess = true;
                    console.log('[analyze-error] Manual extraction successful (no JSON)');
                } else {
                    throw new Error('No valid JSON found and manual extraction failed');
                }
            }
        } catch (generationError) {
            console.error('[analyze-error] Generation failed:', generationError.message);
            console.error('[analyze-error] Full error:', JSON.stringify({
                name: generationError.name,
                message: generationError.message,
                stack: generationError.stack?.substring(0, 500),
                code: generationError.code,
                status: generationError.status
            }));
            // analysis already set to default above
        }

        // Only deduct credits AFTER successful analysis
        let creditsToDeduct = 0;
        let remaining = 0;

        if (analysisSuccess) {
            // Calculate tokens (estimate image as ~258 tokens per image)
            const tokensIn = Math.ceil(promptText.length / 4) + (image ? 258 : 0);
            const tokensOut = Math.ceil(text.length / 4);

            // Dynamic cost: min 5 credits + 30% margin = min 6.5 credits
            creditsToDeduct = calculateCreditCost(tokensIn, tokensOut, !!image);

            const deductionResult = await deductCredits(
                user.id,
                creditsToDeduct,
                'oneshot_fixes',
                image ? 'Error Analysis (with image)' : 'Error Analysis',
                tokensIn,
                tokensOut
            );
            remaining = deductionResult.remaining;
        } else {
            // Get current balance without deducting
            const balanceCheck = await checkSufficientCredits(user.id, 0);
            remaining = balanceCheck.balance;
        }

        // [NEW] Save detailed history to 'analysis_history' table
        try {
            const supabase = await getSupabase(true); // Admin client
            await supabase.from('analysis_history').insert({
                user_id: user.id,
                prompt_content: error_log || (image ? '[Image Only Error]' : '[No Content]'),
                full_log: error_log, // Store full log if available
                analysis_result: analysis, // Store the JSON result
                metadata: {
                    tokens_input: analysisSuccess ? Math.ceil(promptText.length / 4) + (image ? 258 : 0) : 0,
                    tokens_output: analysisSuccess ? Math.ceil(text.length / 4) : 0,
                    model: 'gemini-2.5-flash',
                    credits_cost: creditsToDeduct,
                    tags: tags,
                    has_image: !!image,
                    success: analysisSuccess
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
            tokens_input: analysisSuccess ? Math.ceil(promptText.length / 4) + (image ? 258 : 0) : 0,
            tokens_output: analysisSuccess ? Math.ceil(text.length / 4) : 0,
            tokens_total: analysisSuccess ? (Math.ceil(promptText.length / 4) + (image ? 258 : 0) + Math.ceil(text.length / 4)) : 0,
            credits_used: creditsToDeduct,
            credits_remaining: remaining,
            had_image: !!image,
            processing_time: '~2s'
        });

    } catch (err) {
        return createErrorResponse(err);
    }
}
