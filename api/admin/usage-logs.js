import { getSupabase, requireAuth, createResponse, createErrorResponse, corsHeaders } from '../_helpers.js';

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
        const toolFilter = url.searchParams.get('tool_filter') || '';

        let query = supabase
            .from('credit_usage_logs')
            .select(`
                *,
                profiles:user_id (name, email)
            `)
            .order('created_at', { ascending: false })
            .range(skip, skip + limit - 1);

        if (toolFilter) {
            query = query.eq('tool_used', toolFilter);
        }

        const { data, error } = await query;

        if (error) throw error;

        const formatted = data.map(log => ({
            id: log.id,
            timestamp: log.created_at,
            user_name: log.profiles?.name || 'Unknown',
            user_email: log.profiles?.email || '',
            tool_used: log.tool_used,
            tokens_input: log.tokens_input || 0,
            tokens_output: log.tokens_output || 0,
            total_tokens: log.total_tokens || 0,
            credits_debited: log.credits_debited || 0,
            success: log.credits_debited !== undefined // Log exists = was processed
        }));

        return createResponse(formatted);

    } catch (err) {
        return createErrorResponse(err);
    }
}
