import { getSupabase, requireAuth, createResponse, createErrorResponse, corsHeaders } from '../../_helpers.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders() });
    }

    try {
        await requireAuth(request);
        const supabase = await getSupabase(true); // Use Admin Client

        // Parallel stats fetching
        const [
            { count: totalUsers },
            { count: totalLogs }
        ] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('credit_usage_logs').select('*', { count: 'exact', head: true })
        ]);

        // Fetch aggregation data
        const { data: allProfiles } = await supabase.from('profiles').select('plan, credit_balance');

        let totalCredits = 0;
        let planStats = { starter: 0, builder: 0, pro: 0 };
        let activeUsers = allProfiles ? allProfiles.length : 0; // Using visible profiles count

        if (allProfiles) {
            allProfiles.forEach(p => {
                totalCredits += (p.credit_balance || 0);
                if (p.plan) planStats[p.plan] = (planStats[p.plan] || 0) + 1;
            });
        }

        const { data: usageLogs } = await supabase.from('credit_usage_logs').select('credits_debited');
        let totalConsumed = 0;
        if (usageLogs) {
            usageLogs.forEach(l => {
                if (l.credits_debited > 0) totalConsumed += l.credits_debited;
            });
        }

        const stats = {
            total_users: totalUsers || 0,
            active_users: activeUsers,
            total_credits_distributed: totalCredits,
            total_credits_consumed: totalConsumed,
            total_scripts: 12,
            total_analyses: totalLogs || 0,
            total_designs: 0,
            users_by_plan: planStats
        };

        return createResponse(stats);

    } catch (err) {
        return createErrorResponse(err);
    }
}
