module.exports = {
    async fetch(request) {
        return new Response(JSON.stringify({ 
            status: "healthy", 
            timestamp: new Date(), 
            version: "2.0.0 (Vercel)" 
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
};
