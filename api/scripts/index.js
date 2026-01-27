import { getSupabase, requireAuth, createResponse, createErrorResponse, corsHeaders } from '../_helpers.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders() });
    }

    try {
        await requireAuth(request); // Must be logged in
        const supabase = await getSupabase(); // Use Standard Client (RLS applies)

        // GET - Listar scripts ativos
        if (request.method === 'GET') {
            const url = new URL(request.url);
            const category = url.searchParams.get('category');

            let query = supabase
                .from('premium_scripts')
                .select('*')
                .eq('is_active', true) // Apenas ativos
                .order('created_at', { ascending: false });

            if (category && category !== 'Todas') {
                query = query.eq('category', category);
            }

            const { data, error } = await query;
            if (error) throw error;

            return createResponse(data);
        }

        return createResponse({ message: 'Method not allowed' }, 405);

    } catch (err) {
        return createErrorResponse(err);
    }
}
