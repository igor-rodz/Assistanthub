import { getSupabase, requireAuth, createResponse, createErrorResponse, corsHeaders } from '../_helpers.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders() });
    }

    try {
        const user = await requireAuth(request);
        const supabase = await getSupabase(true); // Admin to bypass RLS

        // Get usage history from credit_usage_logs
        const { data, error } = await supabase
            .from('credit_usage_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('[credits/usage] Error fetching logs:', error.message);
            return createResponse({ usage_history: [] });
        }

        // Transform data for frontend
        const usageHistory = (data || []).map(log => ({
            id: log.id,
            action: log.tool_used || 'Ação Desconhecida',
            summary: log.summary || '',
            date: new Date(log.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            cost: log.credits_debited || 0,
            tokens: log.total_tokens || 0,
            tokens_input: log.tokens_input || 0,
            tokens_output: log.tokens_output || 0,
            balance_before: log.balance_before,
            balance_after: log.balance_after
        }));

        // Calculate totals
        const totalCreditsUsed = usageHistory.reduce((sum, item) => sum + item.cost, 0);
        const totalTokens = usageHistory.reduce((sum, item) => sum + item.tokens, 0);

        return createResponse({
            usage_history: usageHistory,
            total_credits_used: Math.round(totalCreditsUsed * 100) / 100,
            total_tokens: totalTokens,
            count: usageHistory.length
        });

    } catch (err) {
        return createErrorResponse(err);
    }
}
