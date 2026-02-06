// Shared helpers for Vercel Serverless Functions
// Clean, optimized, production-ready

let supabaseClient = null;
let supabaseAdminClient = null;
let geminiModel = null;

// --- LAZY LOADERS ---

export async function getSupabase(useAdmin = false) {
    const { createClient } = await import('@supabase/supabase-js');
    const url = (process.env.SUPABASE_URL || 'https://ipxpsxzllgnklqynkymr.supabase.co')?.trim();

    if (useAdmin) {
        if (!supabaseAdminClient) {
            // Tenta pegar a variável de ambiente, ou usa a chave explícita como fallback de emergência
            // ATENÇÃO: Em produção ideal, use apenas variáveis de ambiente. Isso é um patch para garantir funcionamento.
            let key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlweHBzeHpsbGdua2xxeW5reW1yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQ4ODE4MSwiZXhwIjoyMDg0MDY0MTgxfQ.Lrrcqbgccw-dqWlppMKKyyDzVDY_zeELKFF6LlDIQAQ';

            if (!key) {
                console.warn("SUPABASE_SERVICE_ROLE_KEY missing using Anon fallback.");
                key = (process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlweHBzeHpsbGdua2xxeW5reW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODgxODEsImV4cCI6MjA4NDA2NDE4MX0.9YmBqz5kZS69cZ5GLOKRTrGNstPBWMvmwaLhSWRpoHU')?.trim();
                supabaseAdminClient = createClient(url, key, { auth: { persistSession: false } });
            } else {
                // Admin Client com Service Role (Bypassa RLS)
                supabaseAdminClient = createClient(url, key, {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                });
            }
        }
        return supabaseAdminClient;
    }

    if (!supabaseClient) {
        const key = (process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlweHBzeHpsbGdua2xxeW5reW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODgxODEsImV4cCI6MjA4NDA2NDE4MX0.9YmBqz5kZS69cZ5GLOKRTrGNstPBWMvmwaLhSWRpoHU')?.trim();

        if (!url || !key) {
            throw { status: 500, message: 'Missing Supabase credentials' };
        }

        supabaseClient = createClient(url, key, {
            auth: { persistSession: false, autoRefreshToken: false }
        });
    }
    return supabaseClient;
}

export async function getGeminiModel() {
    if (!geminiModel) {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const key = process.env.GEMINI_API_KEY?.trim();

        if (!key) {
            throw { status: 500, message: 'Missing Gemini API key' };
        }

        const genAI = new GoogleGenerativeAI(key);
        geminiModel = genAI.getGenerativeModel({
            model: "gemini-2.5-flash", // Gemini 2.5 Flash (Always strict rule)
            generationConfig: {
                temperature: 0.3,
                topP: 0.9,
                maxOutputTokens: 8192, // Increased for detailed prompts
                responseMimeType: 'application/json'
            }
        });
    }
    return geminiModel;
}

export async function generateWithRetry(model, prompt, retries = 2) {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`[generateWithRetry] Attempt ${i + 1}/${retries}`);
            const result = await model.generateContent(prompt);
            return result;
        } catch (error) {
            console.error(`[generateWithRetry] Attempt ${i + 1} failed:`, error.message);
            if (i === retries - 1) throw error;
            // Wait longer between retries for Gemini stability
            await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        }
    }
}

// --- AUTH ---

export async function requireAuth(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
        throw { status: 401, message: "Authorization required" };
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        throw { status: 401, message: "Invalid authorization format" };
    }

    const supabase = await getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        throw { status: 401, message: "Invalid or expired token" };
    }

    return user;
}

// --- UTILITIES ---

export function uuidv4() {
    return crypto.randomUUID();
}

export async function getRequestBody(request) {
    try {
        return await request.json();
    } catch {
        return {};
    }
}

export function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

export function createResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
}

export function createErrorResponse(error, defaultStatus = 500) {
    const status = error.status || defaultStatus;
    const message = error.message || "Internal Server Error";
    const isQuotaError = error.isQuotaError || false;

    console.error(`[API Error ${status}]:`, message);

    return new Response(JSON.stringify({
        error: message,
        isQuotaError: isQuotaError,
        status: status
    }), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
}

// --- CREDITS (Fixed - Actually deducts now!) ---

export async function checkSufficientCredits(userId, cost) {
    const supabase = await getSupabase(true); // Admin to bypass RLS
    const { data: profile } = await supabase
        .from('profiles')
        .select('credit_balance')
        .eq('id', userId)
        .single();

    if (!profile) return { hasCredits: false, balance: 0 };

    const balance = profile.credit_balance || 0;
    return {
        hasCredits: balance >= cost,
        balance: balance
    };
}

export async function deductCredits(userId, amount, tool, summary, tokensIn, tokensOut) {
    try {
        const supabase = await getSupabase(true); // Admin to bypass RLS

        // 1. Get current balance
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('credit_balance')
            .eq('id', userId)
            .single();

        if (fetchError) {
            console.error('[deductCredits] Error fetching profile:', fetchError.message);
            return { used: amount, remaining: 0 };
        }

        const currentBalance = profile?.credit_balance || 0;
        const newBalance = Math.max(0, currentBalance - amount);

        // 2. Update balance in profiles table
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ credit_balance: newBalance })
            .eq('id', userId);

        if (updateError) {
            console.error('[deductCredits] Error updating balance:', updateError.message);
            return { used: amount, remaining: currentBalance };
        }

        // 3. Log the usage
        await supabase.from('credit_usage_logs').insert({
            id: uuidv4(),
            user_id: userId,
            tool_used: tool,
            summary: summary,
            credits_debited: amount,
            tokens_input: tokensIn,
            tokens_output: tokensOut,
            total_tokens: tokensIn + tokensOut,
            balance_before: currentBalance,
            balance_after: newBalance,
            created_at: new Date().toISOString()
        });

        console.log(`[deductCredits] User ${userId}: ${currentBalance} -> ${newBalance} (-${amount})`);

        return { used: amount, remaining: newBalance };
    } catch (err) {
        console.error('[deductCredits] Unexpected error:', err.message);
        return { used: amount, remaining: 0 };
    }
}

// Calculate dynamic cost based on tokens (Fixed Base 6.5 + Variable)
export function calculateCreditCost(tokensIn, tokensOut, hasImage = false) {
    const totalTokens = tokensIn + tokensOut;

    // Variable cost: 1 credit per 1000 tokens
    const tokenCost = totalTokens / 1000;

    // Image cost: 0.5 per image
    const imageCost = hasImage ? 0.5 : 0;

    // Fixed Base Cost
    const baseCost = 6.50;

    // Total = Fixed Base + Variable (Tokens + Image)
    // Example: 6.50 + 4.00 = 10.50
    const finalCost = baseCost + tokenCost + imageCost;

    // Round to 2 decimal places
    return Math.round(finalCost * 100) / 100;
}

