import { getSupabase, requireAuth, createResponse, createErrorResponse, corsHeaders } from '../_helpers.js';

export default async function handler(request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders() });
    }

    try {
        const user = await requireAuth(request);
        const supabase = await getSupabase();

        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

        if (error) {
            throw { status: 404, message: "User not found" };
        }

        return createResponse(data);

    } catch (err) {
        return createErrorResponse(err);
    }
}
