export default async function handler(request) {
    // Simplified health check - no heavy imports
    const envCheck = {
        supabaseUrl: !!process.env.SUPABASE_URL,
        supabaseKey: !!process.env.SUPABASE_KEY,
        geminiKey: !!process.env.GEMINI_API_KEY,
        corsOrigins: !!process.env.CORS_ORIGINS
    };

    return new Response(JSON.stringify({
        status: "healthy",
        environment: envCheck,
        timestamp: new Date().toISOString(),
        message: "API is running"
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}
