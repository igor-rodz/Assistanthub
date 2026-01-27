import {
    getGeminiModel,
    getSupabase,
    deductCredits,
    corsHeaders
} from '../_helpers.js';
import { getSystemPrompt } from './_knowledge.js';

export const config = {
    // Aumentando timeout para suportar o processo de pensamento longo e geração de código complexo
    // Vercel Serverless Functions têm limites (10s Hobby, 60s Pro). 
    // O stream ajuda a manter a conexão, mas a execução total tem limite.
    // Se o usuário estiver self-hosted ou edge, isso é flexível.
    maxDuration: 60
};

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.status(200).set(corsHeaders()).end();
        return;
    }

    Object.entries(corsHeaders()).forEach(([key, value]) => {
        res.setHeader(key, value);
    });

    try {
        // --- 1. Security & Auth ---
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) throw { status: 401, message: "Unauthorized: Missing Token" };

        const supabase = await getSupabase();
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) throw { status: 401, message: "Unauthorized: Invalid Token" };

        const { prompt, design_type = "landing_page", fidelity = "high" } = req.body;
        if (!prompt) throw { status: 400, message: "Prompt is required" };

        // --- 2. Stream Setup ---
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); // Crucial for Nginx/Proxies

        // --- 3. AI Agent Initialization ---
        // Usando Gemini 2.0 Flash Experimental para melhor raciocínio e velocidade
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Mapeamento dinâmico do modelo - Flash é rápido e bom para código
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            generationConfig: {
                temperature: 0.7, // Criatividade controlada
                maxOutputTokens: 8192, // Alto limite para output de HTML completo
                topP: 0.95,
                topK: 64,
            }
        });

        // --- 4. Context Injection ---
        // Construímos o prompt "Mestre" com todas as skills injetadas
        const fullPrompt = getSystemPrompt(prompt);

        console.log(`[DesignLab] Iniciando Job: ${prompt.substring(0, 50)}...`);

        // --- 5. Execution ---
        const result = await model.generateContentStream(fullPrompt);

        let accumulatedCode = '';
        let insideCodeBlock = false;
        let responseTokens = 0;

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            responseTokens += Math.ceil(chunkText.length / 4); // Estimativa grosseira

            // Pass-through direto para o frontend que já sabe fazer parse das tags :::TAG:::
            res.write(chunkText);

            // Coleta código para logs
            if (chunkText.includes(':::CODE_START:::')) insideCodeBlock = true;
            if (chunkText.includes(':::CODE_END:::')) insideCodeBlock = false;

            // Tratamento mais robusto para capturar todo o código, mesmo se o marker quebrar no chunk
            if (insideCodeBlock || chunkText.includes('<!DOCTYPE html>')) {
                // Remove markers se vierem no mesmo chunk
                let clearChunk = chunkText
                    .replace(':::CODE_START:::', '')
                    .replace(':::CODE_END:::', '')
                    .replace('```html', '') // Fallback caso o modelo alucine markdown
                    .replace('```', '');

                accumulatedCode += clearChunk;
            }
        }

        // --- 6. Logging & Billing (Post-Process) ---
        // Fire-and-forget para não travar a response
        (async () => {
            try {
                if (accumulatedCode.length > 50) {
                    await deductCredits(
                        user.id,
                        2, // Custo maior pois é um agente "Premium" (Bolt-like)
                        'design_lab_v2',
                        `Design Agent: ${prompt.substring(0, 30)}`,
                        Math.ceil(fullPrompt.length / 4),
                        responseTokens
                    );

                    // TODO: Salvar o artefato gerado no Supabase Storage ou Table para histórico
                    // Por enquanto só deduzimos crédito e logamos
                    console.log(`[DesignLab] Job Finalizado. Tokens gerados: ~${responseTokens}`);
                }
            } catch (err) {
                console.error('[DesignLab] Erro no log pós-request:', err);
            }
        })();

        res.write('\n\n:::DONE:::\n'); // Sinal explícito de fim
        res.end();

    } catch (error) {
        console.error("[DesignLab] Fatal Error:", error);
        res.write(`\n:::ERROR::: ${error.message || "Erro interno no agente de design"}\n`);
        res.end();
    }
}
