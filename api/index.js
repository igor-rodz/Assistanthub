// Root API endpoint
module.exports = {
    async fetch(request) {
        return new Response(JSON.stringify({ 
            message: "AI Assistant Dashboard API (Vercel Serverless)" 
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
};
