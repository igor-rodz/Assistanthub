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
    console.log("Diagnosticando tabelas...");

    // Tenta ler profiles novamente
    const { data, error } = await supabase.from('profiles').select('*').limit(5);

    if (error) {
        console.error("Erro ao ler profiles:", error);
    } else {
        console.log("Profiles encontrados (Keys):", data.length > 0 ? Object.keys(data[0]) : "Nenhum");
        console.log("Full User 0:", JSON.stringify(data[0], null, 2));
        if (data.length > 0) {
            console.log("Tentando atualizar o primeiro usuário encontrado...");
            const user = data[0];
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ plan: 'pro' })
                .eq('id', user.id);

            if (updateError) console.error("Erro no update:", updateError);
            else console.log("Update com sucesso para:", user.email);
        }
    }
}

run();
