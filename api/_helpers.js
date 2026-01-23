// Shared helpers for Vercel serverless functions
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';

// Initialize clients (singleton pattern)
let supabaseClient = null;
let geminiModel = null;

export function getSupabase() {
    if (!supabaseClient) {
        const supabaseUrl = process.env.SUPABASE_URL?.trim() || '';
        const supabaseKey = process.env.SUPABASE_KEY?.trim() || '';

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing SUPABASE_URL or SUPABASE_KEY environment variables');
        }

        supabaseClient = createClient(supabaseUrl, supabaseKey);
    }
    return supabaseClient;
}

export function getGeminiModel() {
    if (!geminiModel) {
        const geminiApiKey = process.env.GEMINI_API_KEY?.trim() || '';

        if (!geminiApiKey) {
            throw new Error('Missing GEMINI_API_KEY environment variable');
        }

        const genAI = new GoogleGenerativeAI(geminiApiKey);
        geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    }
    return geminiModel;
}

export async function requireAuth(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
        throw { status: 401, message: "Authorization token required" };
    }

    const token = authHeader.split(' ')[1];
    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        throw { status: 401, message: "Invalid token" };
    }

    return user;
}

export async function getRequestBody(request) {
    try {
        return await request.json();
    } catch (e) {
        return {};
    }
}

export async function checkSufficientCredits(userId, amount) {
    return { hasCredits: true, balance: 9999.0 };
}

export async function deductCredits(userId, amount, tool, summary, tokensIn, tokensOut) {
    try {
        const supabase = getSupabase();

        const { data: creditData, error: creditError } = await supabase
            .from('user_credits')
            .select('credit_balance')
            .eq('user_id', userId)
            .single();

        if (creditError && creditError.code !== 'PGRST116') {
            console.warn('[deductCredits] Erro ao buscar créditos:', creditError.message);
        }

        const currentBalance = creditData ? creditData.credit_balance : 9999.0;

        if (currentBalance < amount) {
            throw new Error('Insufficient credits');
        }

        const newBalance = currentBalance - amount;

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
        return { used: amount, remaining: 9999.0 };
    }
}

export function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

export { uuidv4 };
