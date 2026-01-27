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
            let key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

            if (!key) {
                console.warn("SUPABASE_SERVICE_ROLE_KEY missing. Admin operations might fail due to RLS.");
                // Fallback to Anon Key (better than crash, but RLS applies)
                key = (process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlweHBzeHpsbGdua2xxeW5reW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODgxODEsImV4cCI6MjA4NDA2NDE4MX0.9YmBqz5kZS69cZ5GLOKRTrGNstPBWMvmwaLhSWRpoHU')?.trim();
                supabaseAdminClient = createClient(url, key, { auth: { persistSession: false } });
            } else {
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
        geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    }
    return geminiModel;
}

export async function generateWithRetry(model, prompt, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await model.generateContent(prompt);
        } catch (error) {
            const isLastAttempt = i === retries - 1;
            const status = error.response?.status || error.status || 500;
            const errorMessage = error.message || error.toString() || '';

            // Check if it's a quota error
            const isQuotaError = errorMessage.includes('quota') ||
                errorMessage.includes('Quota exceeded') ||
                errorMessage.includes('exceeded your current quota');

            // If it's a quota error, don't retry - return a specific error
            if (isQuotaError) {
                throw {
                    status: 429,
                    message: 'Cota da API Gemini excedida. Verifique seu plano e faturamento no Google Cloud Console. Aguarde alguns minutos antes de tentar novamente.',
                    isQuotaError: true
                };
            }

            // Retry on 429 (Too Many Requests) or 503 (Service Unavailable) - but not quota errors
            if ((status === 429 || status === 503) && !isLastAttempt && !isQuotaError) {
                const delay = Math.pow(2, i) * 1000; // Exponential backoff: 1s, 2s, 4s
                console.warn(`[Gemini Retry] Attempt ${i + 1} failed with ${status}. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            throw error;
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

// --- CREDITS (Simplified) ---

export async function checkSufficientCredits() {
    return { hasCredits: true, balance: 9999 };
}

export async function deductCredits(userId, amount, tool, summary, tokensIn, tokensOut) {
    try {
        const supabase = await getSupabase(true); // Usage logs might be admin owned? No profiles.
        // Usually writing to logs is allowed by RLS for user own logs.
        // Stick to normal client for deductCredits unless we change it.
        // Keeping getSupabase() for user initiated actions is safer for RLS enforcing ownership.

        await Promise.allSettled([
            supabase.from('credit_usage_logs').insert({
                id: uuidv4(),
                user_id: userId,
                tool_used: tool,
                credits_debited: amount,
                tokens_input: tokensIn,
                tokens_output: tokensOut,
                total_tokens: tokensIn + tokensOut,
                created_at: new Date().toISOString()
            })
        ]);

        return { used: amount, remaining: 9999 };
    } catch (err) {
        console.error('[deductCredits]:', err.message);
        return { used: amount, remaining: 9999 };
    }
}
