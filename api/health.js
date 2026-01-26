// Health Check - Standalone, zero dependencies
export const config = { runtime: 'edge' };


export default async function handler(request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        });
    }

    try {
        return new Response(JSON.stringify({
            status: "healthy",
            timestamp: new Date().toISOString(),
            environment: {
                supabase: !!process.env.SUPABASE_URL,
                gemini: !!process.env.GEMINI_API_KEY,
                node: process.version
            }
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}
