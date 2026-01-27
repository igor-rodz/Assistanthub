import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ipxpsxzllgnklqynkymr.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlweHBzeHpsbGdua2xxeW5reW1yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQ4ODE4MSwiZXhwIjoyMDg0MDY0MTgxfQ.Lrrcqbgccw-dqWlppMKKyyDzVDY_zeELKFF6LlDIQAQ';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function run() {
    console.log("Iniciando promoção de usuário para PRO...");

    // 1. Tentar encontrar seu usuário pelo email
    // Nota: Como não sei exatamente qual email você usou no login (Supabase Auth), 
    // vou listar os usuários recentes e tentar achar.

    // Primeiro tentamos rodzigor@gmail.com na tabela profiles
    let { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', '%rodzigor%') // Busca flexível
        .limit(5);

    if (!users || users.length === 0) {
        console.log("Usuário 'rodzigor' não encontrado diretamente. Listando os últimos 5 usuários...");
        const response = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5);
        users = response.data;
    }

    if (!users || users.length === 0) {
        console.error("Nenhum usuário encontrado no banco de dados.");
        return;
    }

    if (users.length > 1) {
        console.log("Múltiplos usuários encontrados. Atualizando TODOS que parecem ser você:");
    }

    for (const user of users) {
        console.log(`Atualizando usuário: ${user.email} (${user.id}) para PRO...`);

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                plan: 'pro',
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

        if (updateError) {
            console.error(`Erro ao atualizar ${user.email}:`, updateError.message);
        } else {
            console.log(`✅ Sucesso! Usuário ${user.email} agora é PRO.`);
        }
    }
}

run();
