import { getSupabase, requireAuth, createResponse, createErrorResponse, corsHeaders } from '../_helpers.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders() });
    }

    try {
        const user = await requireAuth(request);
        const supabase = await getSupabase(); // Standard client

        // Busca perfil para ver plano e saldo (se saldo estiver no perfil)
        // Se a coluna 'credit_balance' nao existir, assumimos 0
        // Se a coluna 'plan' nao existir, assumimos starter (ou admin=>pro)

        let { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

        if (error) {
            // Se perfil não existe ou erro, vamos tentar ser robustos
            console.error("Erro ao ler perfil para creditos:", error);
            // Retorna padrão
            return createResponse({
                credit_balance: 0,
                plan: 'starter'
            });
        }

        // Lógica Virtual de Plano para Admin
        let finalPlan = data.plan || 'starter';
        if (data.role === 'admin') {
            finalPlan = 'pro';
        }

        return createResponse({
            credit_balance: data.credit_balance || 0,
            plan: finalPlan, // Retorna 'pro' se for admin, ignorando falta de coluna
            subscription_status: 'active'
        });

    } catch (err) {
        return createErrorResponse(err);
    }
}
