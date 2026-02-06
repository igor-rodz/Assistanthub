import { getSupabase, requireAuth, createResponse, createErrorResponse, corsHeaders } from '../_helpers.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders() });
    }

    try {
        const user = await requireAuth(request);
        const supabase = await getSupabase();

        if (request.method === 'PATCH') {
            const body = await request.json();
            const updates = {};
            if (body.name) updates.name = body.name;
            if (body.avatar) updates.avatar = body.avatar;
            // Email usually handled by Auth, but we can store a display email if needed
            if (body.email) updates.email = body.email;

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;
            return createResponse({ success: true });
        }

        // GET Request
        // 1. Get Profile
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
            throw { status: 404, message: "User not found" };
        }

        // 2. Get Metrics (Count analysis history)
        const { count: totalAnalyses } = await supabase
            .from('analysis_history')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        // 3. Get Saved Prompts (if you have a prompts table, otherwise 0)
        // const { count: savedPrompts } = ...

        const userData = {
            ...profile,
            email: user.email, // Ensure email from Auth is available if profile is empty
            total_analyses: totalAnalyses || 0,
            saved_prompts: 0, // Placeholder
            member_since: new Date(user.created_at || Date.now()).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        };

        return createResponse(userData);

    } catch (err) {
        return createErrorResponse(err);
    }
}
