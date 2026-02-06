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

        // Normalize plan
        let finalPlan = (data.plan || 'free').toLowerCase().trim();

        // Safety: If user has significant credits (> 100), they are NOT free, regardless of label.
        // This handles legacy data or sync issues.
        const balance = data.credit_balance || 0;
        if (balance > 100 && finalPlan === 'free') {
            finalPlan = 'pro';
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
