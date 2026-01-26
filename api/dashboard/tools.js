import { getSupabase, createResponse, createErrorResponse, corsHeaders } from '../_helpers.js';

export default async function handler(request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders() });
    }

    try {
        const supabase = await getSupabase();
        const { data, error } = await supabase.from('tools').select('*').order('id');

        if (error) throw error;

        return createResponse(data || []);

    } catch (err) {
        return createErrorResponse(err);
    }
}
