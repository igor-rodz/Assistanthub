import { getSupabase, requireAuth, createResponse, createErrorResponse, corsHeaders, getRequestBody, uuidv4 } from '../_helpers.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders() });
    }

    try {
        await requireAuth(request);
        const supabase = await getSupabase(true); // Use Admin Client (Service Role)

        if (request.method === 'GET') {
            const url = new URL(request.url);
            const skip = parseInt(url.searchParams.get('skip') || '0');
            const limit = parseInt(url.searchParams.get('limit') || '20');
            const search = url.searchParams.get('search') || '';
            const plan = url.searchParams.get('plan_filter') || '';

            let query = supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })
                .range(skip, skip + limit - 1);

            if (search) {
                query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
            }

            if (plan) {
                query = query.eq('plan', plan);
            }

            const { data, error } = await query;

            if (error) throw error;
            return createResponse(data, 200);
        }

        if (request.method === 'POST') {
            const body = await getRequestBody(request);
            const { action, userId, amount } = body;

            if (action === 'add_credits' || action === 'remove_credits') {
                if (!userId || amount === undefined) throw { status: 400, message: "Missing userId or amount" };

                // Get current balance
                const { data: userProfile, error: fetchError } = await supabase
                    .from('profiles')
                    .select('credit_balance')
                    .eq('id', userId)
                    .single();

                if (fetchError || !userProfile) throw { status: 404, message: "User not found" };

                const newBalance = action === 'add_credits'
                    ? (userProfile.credit_balance || 0) + parseFloat(amount)
                    : (userProfile.credit_balance || 0) - parseFloat(amount);

                // Update Profile
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ credit_balance: newBalance })
                    .eq('id', userId);

                if (updateError) throw updateError;

                // Log Transaction
                await supabase.from('credit_usage_logs').insert({
                    id: uuidv4(),
                    user_id: userId,
                    tool_used: 'admin_adjustment',
                    credits_debited: action === 'remove_credits' ? parseFloat(amount) : -parseFloat(amount),
                    created_at: new Date().toISOString()
                });

                return createResponse({ success: true, new_balance: newBalance });
            }
        }

        if (request.method === 'DELETE') {
            const url = new URL(request.url);
            const userId = url.searchParams.get('id');
            if (!userId) throw { status: 400, message: "Missing user ID" };

            // Try deleting from Auth first (requires Service Role)
            const { error: authError } = await supabase.auth.admin.deleteUser(userId);

            if (authError) {
                console.warn("Auth delete failed, trying profile delete:", authError.message);
                // Fallback: Delete from profiles directly
                const { error } = await supabase.from('profiles').delete().eq('id', userId);
                if (error) throw error;
            }

            return createResponse({ success: true });
        }

        return createResponse({ message: "Method not allowed" }, 405);

    } catch (err) {
        return createErrorResponse(err);
    }
}
