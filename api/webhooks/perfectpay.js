import {
    getSupabase,
    corsHeaders,
    createResponse,
    createErrorResponse
} from '../_helpers.js';

export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    if (request.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders() });
    }

    if (request.method !== 'POST') {
        return createErrorResponse({ status: 405, message: 'Method not allowed' });
    }

    try {
        const body = await request.json();
        const {
            token,
            customer,
            sale_status_enum,
            sale_amount,
            code,
            payment_method_enum
        } = body;

        // 1. Validate Token
        const expectedToken = process.env.PERFECTPAY_TOKEN;
        if (!expectedToken || token !== expectedToken) {
            console.error('[PerfectPay] Invalid or missing token');
            return createErrorResponse({ status: 401, message: 'Unauthorized' });
        }

        const supabase = await getSupabase(true);

        const userEmail = customer?.email;
        let userId = null;

        if (userEmail) {
            // Try profiles table first
            const { data: userProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', userEmail)
                .single();

            if (userProfile) {
                userId = userProfile.id;
            } else {
                // Fallback: Search auth.users by email using admin client
                const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

                if (!authError && authUsers?.users) {
                    const foundUser = authUsers.users.find(u => u.email === userEmail);
                    if (foundUser) {
                        userId = foundUser.id;
                        console.log(`[PerfectPay] Found user in auth.users: ${userId}`);
                    }
                }

                if (!userId) {
                    console.warn(`[PerfectPay] User not found for email: ${userEmail}`);
                }
            }
        }

        // 3. Log Transaction
        await supabase.from('transactions').insert({
            perfectpay_code: code,
            user_id: userId,
            amount: sale_amount,
            status: sale_status_enum,
            payment_method: payment_method_enum,
            payload: body
        });

        if (!userId) {
            return createResponse({ message: 'Transaction logged, but user not found.' });
        }

        // 4. Handle Status (Enum: 2 = Approved)
        if (parseInt(sale_status_enum) === 2) {
            const CREDITS_TO_ADD = 100;
            const SUBSCRIPTION_DAYS = 30;

            const cleanDate = new Date();
            cleanDate.setDate(cleanDate.getDate() + SUBSCRIPTION_DAYS);
            const newExpiresAt = cleanDate.toISOString();

            const { data: currentProfile } = await supabase
                .from('profiles')
                .select('credit_balance')
                .eq('id', userId)
                .single();

            const currentBalance = currentProfile?.credit_balance || 0;
            const newBalance = currentBalance + CREDITS_TO_ADD;

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    subscription_status: 'active',
                    subscription_expires_at: newExpiresAt,
                    credit_balance: newBalance
                })
                .eq('id', userId);

            if (updateError) {
                console.error('[PerfectPay] processing error:', updateError);
                throw new Error('Failed to update profile');
            }
        } else if ([3, 6].includes(parseInt(sale_status_enum))) {
            await supabase
                .from('profiles')
                .update({
                    subscription_status: 'canceled'
                })
                .eq('id', userId);
        }

        return createResponse({ success: true });

    } catch (error) {
        console.error('[PerfectPay] Handler Error:', error);
        return createErrorResponse({ status: 500, message: 'Internal Server Error' });
    }
}
