// Standalone health check - NO external dependencies to debug 500 error

export default async function handler(request) {
    // Manually handle CORS
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        });
    }

    try {
        const envCheck = {
            supabaseUrl: !!process.env.SUPABASE_URL,
            supabaseKey: !!process.env.SUPABASE_KEY,
            geminiKey: !!process.env.GEMINI_API_KEY,
            corsOrigins: !!process.env.CORS_ORIGINS,
            nodeVersion: process.version
        };

        return new Response(JSON.stringify({
            status: "healthy",
            mode: "standalone_debug",
            environment: envCheck,
            timestamp: new Date().toISOString(),
            message: "API is online (Dependencies secluded)"
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message, stack: e.stack }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}
