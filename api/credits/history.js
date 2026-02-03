import { getSupabase, requireAuth, createResponse, createErrorResponse, corsHeaders } from '../_helpers.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders() });
    }

    try {
        const user = await requireAuth(request);
        const supabase = await getSupabase(true); // Admin to bypass RLS

        // Get detailed history from analysis_history
        const { data, error } = await supabase
            .from('analysis_history')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('[credits/history] Error fetching logs:', error.message);
            return createResponse({ history: [] });
        }

        // Transform data
        const history = (data || []).map(item => ({
            id: item.id,
            action: 'Análise de Erro',
            summary: (item.prompt_content || '').substring(0, 100) + '...',
            full_prompt: item.prompt_content,
            result: item.analysis_result,
            date: new Date(item.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }),
            cost: item.metadata?.credits_cost || '?',
            tokens: item.metadata?.tokens_input + item.metadata?.tokens_output || 0
        }));

        return createResponse({
            history: history,
            count: history.length
        });

    } catch (err) {
        return createErrorResponse(err);
    }
}
