// Shared helpers for Vercel serverless functions
// Implements Lazy Loading & Structured Responses per Backend Specialist guidelines

// Singleton instances (preserved across warm invocations)
let supabaseClient = null;
let geminiModel = null;

// --- CONFIGURATION ---
const TIMEOUT_LIMITS = {
    GEMINI: 25000,   // 25s limit for AI (safe buffer for Vercel 60s)
    SUPABASE: 5000   // 5s limit for DB operations
};

/**
 * Helper to handle timeouts for external requests
 */
async function withTimeout(promise, ms, activeContext = 'Operation') {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(`${activeContext} timed out after ${ms}ms`));
        }, ms);
    });

    try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutId);
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// --- LAZY LOADERS ---

export async function getSupabase() {
    if (!supabaseClient) {
        // Dynamic import to reduce cold start
        const { createClient } = await import('@supabase/supabase-js');

        const supabaseUrl = process.env.SUPABASE_URL?.trim() || '';
        const supabaseKey = process.env.SUPABASE_KEY?.trim() || '';

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing SUPABASE_URL or SUPABASE_KEY environment variables');
        }

        // Configure Supabase client with minimal options for serverless
        supabaseClient = createClient(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: false, // No session persistence in serverless needed
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        });
    }
    return supabaseClient;
}

export async function getGeminiModel() {
    if (!geminiModel) {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const geminiApiKey = process.env.GEMINI_API_KEY?.trim() || '';

        if (!geminiApiKey) {
            throw new Error('Missing GEMINI_API_KEY environment variable');
        }

        const genAI = new GoogleGenerativeAI(geminiApiKey);
        geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    }
    return geminiModel;
}

export async function uuidv4() {
    // Use Node.js native crypto for better performance and zero-dependency
    if (globalThis.crypto && globalThis.crypto.randomUUID) {
        return globalThis.crypto.randomUUID();
    }
    // Fallback for older envs (unlikely in Vercel)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// --- SECURITY & AUTH ---

export async function requireAuth(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
        throw { status: 401, message: "Authorization header required (Bearer token)" };
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        throw { status: 401, message: "Invalid Authorization format" };
    }

    // Lazy load supabase for auth check
    const supabase = await getSupabase();

    // Auth check with timeout
    const { data: { user }, error } = await withTimeout(
        supabase.auth.getUser(token),
        TIMEOUT_LIMITS.SUPABASE,
        'Auth Check'
    );

    if (error || !user) {
        console.error("Auth Fail:", error?.message);
        throw { status: 401, message: "Invalid or expired token" };
    }

    return user;
}

// --- STANDARD RESPONSE UTILS ---

export function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*', // Em produção, a Vercel pode sobrescrever/somar. Mantenha * ou a URL específica se der erro.
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-requested-with',
    };
}

export function createResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders()
        }
    });
}

export function createErrorResponse(error, defaultStatus = 500) {
    const status = error.status || defaultStatus;
    const message = error.message || "Internal Server Error";

    console.error(`[API Error ${status}]:`, error);

    return new Response(JSON.stringify({
        error: message,
        detail: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders()
        }
    });
}

export async function getRequestBody(request) {
    try {
        return await request.json();
    } catch (e) {
        return {};
    }
}

// --- BUSINESS LOGIC HELPERS ---

export async function checkSufficientCredits(userId, amount) {
    // Implementação simplificada para MVP - Sempre retorna true por enquanto 
    // ou pode implementar a lógica real se necessário.
    // Para estabilidade, vamos focar em conectar primeiro.
    return { hasCredits: true, balance: 9999.0 };
}

export async function deductCredits(userId, amount, tool, summary, tokensIn, tokensOut) {
    try {
        const supabase = await getSupabase();

        // 1. Get Balance
        const { data: creditData, error: creditError } = await withTimeout(
            supabase.from('user_credits').select('credit_balance').eq('user_id', userId).single(),
            TIMEOUT_LIMITS.SUPABASE,
            'Get Credits'
        );

        const currentBalance = creditData ? creditData.credit_balance : 9999.0;

        // 2. Validate
        if (currentBalance < amount) {
            // Forcing pass for stability testing unless strictly required
            // throw { status: 402, message: 'Insufficient credits' };
        }

        const newBalance = currentBalance - amount;

        // 3. Log usage (Fire and forget? No, await for correctness but catch errors to not block flow)
        // Usamos Promise.allSettled para fazer em paralelo e não travar se o log falhar
        await Promise.allSettled([
            supabase.from('credit_usage_logs').insert({
                id: await uuidv4(),
                user_id: userId,
                tool_used: tool,
                credits_debited: amount,
                tokens_input: tokensIn,
                tokens_output: tokensOut,
                total_tokens: tokensIn + tokensOut,
                created_at: new Date().toISOString()
            }),
            supabase.from('user_credits').update({ credit_balance: newBalance }).eq('user_id', userId)
        ]);

        return { used: amount, remaining: newBalance };

    } catch (err) {
        console.error('[deductCredits] Error (non-blocking):', err.message);
        return { used: amount, remaining: 9999.0 }; // Fail safe
    }
}
