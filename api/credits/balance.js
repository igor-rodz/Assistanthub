import { getSupabase, requireAuth, createResponse, createErrorResponse, corsHeaders } from '../_helpers.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders() });
    }

    try {
        const user = await requireAuth(request);
        const supabase = await getSupabase(true); // Admin to bypass RLS

        // Get profile with credit info
        let { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error("Erro ao ler perfil para creditos:", error);
            // Retorna dados zerados em caso de erro grave (perfil não existe)
            return createResponse({
                credit_balance: 0,
                plan: 'free',
                monthly_limit: 50,
                credits_used: 0
            });
        }

        // Logic to determine plan if missing or inconsistent with balance
        let finalPlan = data.plan || 'free';

        // Auto-upgrade visual plan if balance is high but plan says free
        // This fixes the "50" limit display issue for users with high balance
        const balance = data.credit_balance || 0;
        if (finalPlan === 'free' && balance > 60) {
            if (balance > 500) finalPlan = 'pro';
            else finalPlan = 'starter';
        }

        if (data.role === 'admin') {
            finalPlan = 'pro';
        }

        // Calculate credits used this month from logs
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: usageLogs } = await supabase
            .from('credit_usage_logs')
            .select('credits_debited')
            .eq('user_id', user.id)
            .gte('created_at', startOfMonth.toISOString());

        const creditsUsedThisMonth = (usageLogs || []).reduce(
            (sum, log) => sum + (log.credits_debited || 0),
            0
        );

        // Plan limits
        const planLimits = {
            free: 50,
            starter: 500,
            pro: 700,
            enterprise: 5000
        };

        const monthlyLimit = planLimits[finalPlan] || 700;

        console.log('[credits/balance] DEBUG:', { balance, finalPlan, monthlyLimit, role: data.role });

        return createResponse({
            credit_balance: balance,
            plan: finalPlan,
            subscription_status: 'active',
            monthly_limit: monthlyLimit,
            credits_used: Math.round(creditsUsedThisMonth * 100) / 100,
            last_updated: new Date().toISOString()
        });

    } catch (err) {
        return createErrorResponse(err);
    }
}
