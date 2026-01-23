export default async function handler(request) {
    const envCheck = {
        supabaseUrl: !!process.env.SUPABASE_URL,
        supabaseKey: !!process.env.SUPABASE_KEY,
        geminiKey: !!process.env.GEMINI_API_KEY,
    };

    let dependencyCheck = "OK";
    try {
        await import('@supabase/supabase-js');
        await import('@google/generative-ai');
    } catch (e) {
        dependencyCheck = "Missing Dependency: " + e.message;
    }

    return new Response(JSON.stringify({
        status: "healthy",
        environment: envCheck,
        dependencies: dependencyCheck,
        timestamp: new Date().toISOString()
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' // Allow CORS for testing
        }
    });
}
