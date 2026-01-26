// Shared helpers for Vercel Serverless Functions
// Clean, optimized, production-ready

let supabaseClient = null;
let geminiModel = null;

// --- LAZY LOADERS ---

export async function getSupabase() {
    if (!supabaseClient) {
        const { createClient } = await import('@supabase/supabase-js');
        const url = (process.env.SUPABASE_URL || 'https://ipxpsxzllgnklqynkymr.supabase.co')?.trim();
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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

    console.error(`[API Error ${status}]:`, message);

    return new Response(JSON.stringify({ error: message }), {
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
        const supabase = await getSupabase();

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
