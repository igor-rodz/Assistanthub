// Test environment variables
module.exports = {
    async fetch(request) {
        const env = {
            hasSupabaseUrl: !!process.env.SUPABASE_URL,
            hasSupabaseKey: !!process.env.SUPABASE_KEY,
            hasGeminiKey: !!process.env.GEMINI_API_KEY,
            nodeEnv: process.env.NODE_ENV
        };

        // Don't expose actual values
        return new Response(JSON.stringify(env, null, 2), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
};
