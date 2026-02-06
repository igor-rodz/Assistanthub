import { getSupabase, requireAuth, createResponse, createErrorResponse } from '../_helpers.js';

export const config = { runtime: 'nodejs' };

export default async function handler(request) {
    if (request.method === 'OPTIONS') return createResponse({}, 200);

    try {
        const user = await requireAuth(request);
        const url = new URL(request.url);
        const plan = url.searchParams.get('plan');

        // SINGLE PLAN LOGIC: R$ 39,90 = 700 credits.
        const newCredits = 600;
        const newPlan = 'pro';

        const supabase = await getSupabase(true);

        const { data, error } = await supabase.from('profiles').update({
            plan: newPlan,
            credit_balance: newCredits
        }).eq('id', user.id).select().single();

        if (error) throw error;

        return createResponse(data);
    } catch (e) {
        return createErrorResponse(e);
    }
}
