export default async function handler(request) {
    return new Response(JSON.stringify({
        status: "healthy",
        timestamp: new Date(),
        version: "2.1.0 (ESM Fetch)"
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}
