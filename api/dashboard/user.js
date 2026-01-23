import { getSupabase, requireAuth } from '../_helpers.js';

export default async function handler(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        });
    }

    try {
        const user = await requireAuth(request);
        const supabase = getSupabase();

        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

        if (error) {
            return new Response(JSON.stringify({ detail: "User not found" }), {
                status: 404,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    } catch (err) {
        const status = err.status || 500;
        const message = err.message || "Error fetching user";
        return new Response(JSON.stringify({ detail: message }), {
            status: status,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}
