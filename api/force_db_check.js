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
    console.log("Iniciando correção forçada do banco de dados...");

    // 1. Criar tabela se não existir (via RPC ou admin API se possível, mas aqui vamos tentar RPC exec_sql se existir, senão via criação direta é complexo sem SQL editor).
    // MAS, vamos assumir que o erro era de POLICY (RLS), o que implica que a tabela JÁ EXISTE.
    // O erro "new row violates row-level security policy" PROVA que a tabela existe, senão seria "relation does not exist".

    // Como SQL direto não roda via JS client normal, vamos tentar uma inserção com a chave de serviço.
    // A chave de serviço IGNORA RLS. 
    // Então, se o erro aconteceu, foi porque o backend (vercel) estava usando a chave ANON (padrão) em vez da SERVICE_ROLE.

    // O que eu vou fazer aqui é TESTAR se a Service Role funciona. Se funcionar, o problema é puramente de ENV VAR no Vercel.

    try {
        console.log("Tentando inserir script de teste com Service Role Key...");
        const { data, error } = await supabase.from('premium_scripts').insert({
            title: 'Script de Teste Automático',
            description: 'Criado pelo Agente para validar permissões',
            script_content: 'Teste de conteúdo',
            category: 'Teste',
            is_active: true
        }).select().single();

        if (error) {
            console.error("ERRO CRÍTICO (Service Role falhou):", error);
        } else {
            console.log("SUCESSO! A chave Service Role funciona e inseriu o script:", data.id);
            console.log("Isso confirma que o problema é FALTA DA VARIAVEL 'SUPABASE_SERVICE_ROLE_KEY' no Vercel.");

            // Vamos remover o teste
            await supabase.from('premium_scripts').delete().eq('id', data.id);
            console.log("Script de teste removido.");
        }

    } catch (e) {
        console.error("Exceção:", e);
    }
}

run();
