import { getSupabase, requireAuth, uuidv4, createResponse, createErrorResponse, corsHeaders } from '../_helpers.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders() });
    }

    try {
        const user = await requireAuth(request);
        const supabase = await getSupabase();

        const [corrections, designs] = await Promise.all([
            supabase.from('credit_usage_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('tool_used', 'oneshot_fixes'),
            supabase.from('credit_usage_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('tool_used', 'design_job')
        ]);

        return createResponse({
            id: uuidv4(),
            corrections: corrections.count || 0,
            designs: designs.count || 0,
            saved: 0,
            updated_at: new Date()
        });

    } catch (err) {
        return createErrorResponse(err);
    }
}
