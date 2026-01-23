export default function handler(request) {
    return new Response(JSON.stringify({
        message: "Works!",
        time: new Date().toISOString()
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
