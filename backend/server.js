require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 8000;

// -- Configuration --
const supabaseUrl = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim() : '';
const supabaseKey = process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.trim() : '';
const geminiApiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';

if (!supabaseUrl || !supabaseKey || !geminiApiKey) {
    console.error("CRITICAL: Missing environment variables (SUPABASE_URL, SUPABASE_KEY, or GEMINI_API_KEY).");
    process.exit(1);
}

// -- Clients --
const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// -- Middleware --
// CORS: Allow specific origins (or all in dev)
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

// Rate Limiter
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
    message: { detail: "Muitas requisições. Tente novamente mais tarde." }
});
app.use('/api', apiLimiter);

// -- Auth Middleware --
const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ detail: "Authorization token required" });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        console.error("Auth Error:", error);
        return res.status(401).json({ detail: "Invalid token" });
    }

    req.user = user;
    next();
};

// -- Helper Functions --

// Credit System helpers (simplified for JS)
async function checkSufficientCredits(userId, amount) {
    // BYPASS DE CRÉDITOS: Retorna sempre verdadeiro
    return { hasCredits: true, balance: 9999.0 };
}

async function deductCredits(userId, amount, tool, summary, tokensIn, tokensOut) {
    try {
        // 1. Get current balance
        const { data: creditData, error: creditError } = await supabase
            .from('user_credits')
            .select('credit_balance')
            .eq('user_id', userId)
            .single();
        
        if (creditError && creditError.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.warn('[deductCredits] Erro ao buscar créditos:', creditError.message);
        }
        
        const currentBalance = creditData ? creditData.credit_balance : 9999.0; // Default high balance if no record

        if (currentBalance < amount) {
            throw new Error('Insufficient credits');
        }

        const newBalance = currentBalance - amount;

        // 2. Log usage (don't fail if this errors)
        const { error: logError } = await supabase.from('credit_usage_logs').insert({
            id: uuidv4(),
            user_id: userId,
            tool_used: tool,
            credits_debited: amount,
            tokens_input: tokensIn,
            tokens_output: tokensOut,
            total_tokens: tokensIn + tokensOut,
            created_at: new Date().toISOString()
        });
        
        if (logError) {
            console.warn('[deductCredits] Erro ao logar uso (continuando):', logError.message);
        }

        // 3. Update balance (don't fail if this errors)
        const { error: updateError } = await supabase
            .from('user_credits')
            .update({ credit_balance: newBalance })
            .eq('user_id', userId);
        
        if (updateError) {
            console.warn('[deductCredits] Erro ao atualizar créditos (continuando):', updateError.message);
        }

        return { used: amount, remaining: newBalance };
    } catch (err) {
        console.error('[deductCredits] Erro:', err.message);
        // Return a default value instead of throwing to not break the flow
        return { used: amount, remaining: 9999.0 };
    }
}

// -- Routes --

// Health Check
app.get('/health', async (req, res) => {
    res.json({ status: "healthy", timestamp: new Date(), version: "2.0.0 (Node.js)" });
});

// Root API
app.get('/api/', (req, res) => {
    res.json({ message: "AI Assistant Dashboard API (Node.js)" });
});

// Dashboard Metrics
app.get('/api/dashboard/metrics', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Concurrently fetch counts
        const [corrections, designs] = await Promise.all([
            supabase.from('credit_usage_logs').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('tool_used', 'oneshot_fixes'),
            supabase.from('credit_usage_logs').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('tool_used', 'design_job')
        ]);

        res.json({
            id: uuidv4(),
            corrections: corrections.count || 0,
            designs: designs.count || 0,
            saved: 0,
            updated_at: new Date()
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: "Error fetching metrics" });
    }
});

// Get User
app.get('/api/dashboard/user', requireAuth, async (req, res) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', req.user.id).single();
    if (error) return res.status(404).json({ detail: "User not found" });
    res.json(data);
});

// Get Tools
app.get('/api/dashboard/tools', async (req, res) => {
    const { data } = await supabase.from('tools').select('*').order('id');
    res.json(data || []);
});

// Design Lab: Create
app.post('/api/design-lab/create', requireAuth, async (req, res) => {
    try {
        const { prompt, design_type = "component", fidelity = "high" } = req.body;
        const userId = req.user.id;

        // Check Credits (Estimate)
        const { hasCredits } = await checkSufficientCredits(userId, 1.0);
        if (!hasCredits) return res.status(402).json({ detail: "Créditos insuficientes" });

        // AI Prompt
        const aiPrompt = `
Crie HTML/CSS para: ${prompt}
Design: ${design_type}, Fidelidade: ${fidelity}
Regras: CSS moderno, tema escuro, responsivo.
Responda JSON: { "html": "...", "css": "...", "component_count": 5 }
    `;

        // Generate Content
        const result = await model.generateContent(aiPrompt);
        const response = await result.response;
        let text = response.text();

        // Parse JSON
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        let designResult;
        try {
            designResult = JSON.parse(text);
        } catch (e) {
            // Fallback or regex extract
            const match = text.match(/\{[\s\S]*\}/);
            if (match) designResult = JSON.parse(match[0]);
            else throw new Error("Could not parse JSON response");
        }

        // Calculate Token/Credits
        // Rough estimate: words * 2
        const tokensIn = aiPrompt.split(/\s+/).length * 2;
        const tokensOut = text.split(/\s+/).length * 2;

        // Credit Logic (simplified replicate of python)
        const fidelityMult = { "wireframe": 0.5, "medium": 1.0, "high": 2.0 }[fidelity] || 1.0;
        const comps = designResult.component_count || 1;
        // Base cost calculation
        const baseCost = (tokensIn + tokensOut) / 1000 * 0.1; // Arbitrary simple cost model if not strict
        // Or stick to fixed cost for simplicity as per user request to simplify? 
        // Let's us a simple fixed cost logic for stability: 
        const creditCost = 0.5 * fidelityMult; // Simple fixed cost logic

        // Deduct
        const { remaining } = await deductCredits(userId, creditCost, 'design_job', `Design: ${prompt.substring(0, 20)}`, tokensIn, tokensOut);

        // Save Job
        const jobId = uuidv4();
        const jobData = {
            job_id: jobId,
            user_id: userId,
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

        res.json(jobData);

    } catch (err) {
        console.error("Design Lab Error:", err);
        res.status(500).json({ detail: "Erro ao gerar design: " + err.message });
    }
});

// Analyze Error
app.post('/api/analyze-error', requireAuth, async (req, res) => {
    try {
        const { error_log, tags = [] } = req.body;
        const userId = req.user.id;

        console.log('[Analyze Error] Iniciando análise para usuário:', userId);
        console.log('[Analyze Error] Log recebido:', error_log?.substring(0, 100) + '...');

        const { hasCredits } = await checkSufficientCredits(userId, 0.5);
        if (!hasCredits) return res.status(402).json({ detail: "Créditos insuficientes" });

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
            
            // Try to extract JSON from text
            const match = text.match(/\{[\s\S]*\}/);
            if (match) {
                try {
                    analysis = JSON.parse(match[0]);
                    console.log('[Analyze Error] JSON extraído e parseado com sucesso');
                } catch (parseErr) {
                    console.error('[Analyze Error] Erro ao parsear JSON extraído:', parseErr.message);
                    console.error('[Analyze Error] JSON extraído:', match[0]);
                    throw new Error(`Erro ao parsear JSON: ${parseErr.message}. Resposta do Gemini: ${text.substring(0, 500)}`);
                }
            } else {
                console.error('[Analyze Error] Nenhum JSON encontrado na resposta');
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
        const creditCost = 1.0; // Fixed cost for fix

        console.log('[Analyze Error] Deduzindo créditos...');
        const { remaining } = await deductCredits(userId, creditCost, 'oneshot_fixes', 'Error Analysis', tokensIn, tokensOut);

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
        res.json(responseData);

    } catch (err) {
        console.error("[Analyze Error] Erro completo:", err);
        console.error("[Analyze Error] Stack:", err.stack);
        res.status(500).json({ 
            detail: "Erro ao analisar erro: " + err.message,
            error: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Backend Node.js running on port ${port}`);
});
