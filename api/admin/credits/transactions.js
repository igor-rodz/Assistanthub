import { getSupabase, requireAuth, createResponse, createErrorResponse, corsHeaders } from '../../_helpers.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders() });
    }

    try {
        await requireAuth(request);
        const supabase = await getSupabase(true); // Use Admin Client

        const url = new URL(request.url);
        const skip = parseInt(url.searchParams.get('skip') || '0');
        const limit = parseInt(url.searchParams.get('limit') || '50');

        const { data, error } = await supabase
            .from('credit_usage_logs')
            .select(`
                *,
                profiles:user_id (name, email)
            `)
            .order('created_at', { ascending: false })
            .range(skip, skip + limit - 1);

        if (error) throw error;

        const formatted = data.map(log => ({
            id: log.id,
            timestamp: log.created_at,
            user_name: log.profiles?.name || 'Unknown',
            type: log.credits_debited > 0 ? 'consumed' : 'added',
            tool_used: log.tool_used,
            amount: -log.credits_debited,
            balance_after: 0
        }));

        return createResponse(formatted);

    } catch (err) {
        return createErrorResponse(err);
    }
}
