import { getSupabase, requireAuth, corsHeaders, uuidv4 } from '../_helpers.js';

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

        const [corrections, designs] = await Promise.all([
            supabase.from('credit_usage_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('tool_used', 'oneshot_fixes'),
            supabase.from('credit_usage_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('tool_used', 'design_job')
        ]);

        return new Response(JSON.stringify({
            id: uuidv4(),
            corrections: corrections.count || 0,
            designs: designs.count || 0,
            saved: 0,
            updated_at: new Date()
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    } catch (err) {
        const status = err.status || 500;
        const message = err.message || "Error fetching metrics";
        return new Response(JSON.stringify({ detail: message }), {
            status: status,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}
