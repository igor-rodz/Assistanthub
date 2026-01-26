import { getSupabase, getGeminiModel, createResponse, createErrorResponse, corsHeaders } from './_helpers.js';

export default async function handler(request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders() });
    }

    // Default fast check (env vars only)
    const url = new URL(request.url);
    const fullCheck = url.searchParams.get('full') === 'true';

    const envCheck = {
        supabaseUrl: !!process.env.SUPABASE_URL,
        supabaseKey: !!process.env.SUPABASE_KEY,
        geminiKey: !!process.env.GEMINI_API_KEY,
        corsOrigins: !!process.env.CORS_ORIGINS,
        nodeEnv: process.env.NODE_ENV
    };

    if (!fullCheck) {
        return createResponse({
            status: "healthy",
            mode: "fast",
            environment: envCheck,
            timestamp: new Date().toISOString(),
            message: "API is running (use ?full=true for connectivity test)"
        });
    }

    // Full connectivity check
    let dbStatus = "unknown";
    let aiStatus = "unknown";

    try {
        // Test Supabase
        const supabase = await getSupabase();
        const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true }).limit(1);
        dbStatus = error ? `Error: ${error.message}` : "connected";
    } catch (e) { dbStatus = `Exception: ${e.message}`; }

    try {
        // Test Gemini (init only)
        await getGeminiModel();
        aiStatus = "initialized";
    } catch (e) { aiStatus = `Exception: ${e.message}`; }

    return createResponse({
        status: (dbStatus === "connected" && aiStatus === "initialized") ? "healthy" : "degraded",
        mode: "full",
        environment: envCheck,
        dependencies: {
            supabase: dbStatus,
            gemini: aiStatus
        },
        timestamp: new Date().toISOString()
    });
}
