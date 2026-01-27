import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ipxpsxzllgnklqynkymr.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlweHBzeHpsbGdua2xxeW5reW1yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQ4ODE4MSwiZXhwIjoyMDg0MDY0MTgxfQ.Lrrcqbgccw-dqWlppMKKyyDzVDY_zeELKFF6LlDIQAQ';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
    console.log("Tentando promover via UPSERT...");

    // 1. Achar usuário
    const { data: users } = await supabase.from('profiles').select('*').limit(5);

    if (!users || users.length === 0) {
        console.log("Nenhum usuário encontrado.");
        return;
    }

    const targetUser = users.find(u => u.email && u.email.includes('rodz')) || users[0];
    console.log("Alvo:", targetUser.email, targetUser.id);

    // 2. Tentar UPSERT (Update or Insert)
    // Isso força a atualização mesmo se o método 'update' estiver reclamando de algo estranho
    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: targetUser.id,
            plan: 'pro',
            ...targetUser // Mantem outros dados se necessário, mas upsert mergeia
        });

    if (error) {
        console.error("UPSERT falhou:", error);
        console.log("\n--- PLANO B: SQL ---");
        console.log(`Por favor, rode este SQL no Supabase:`);
        console.log(`UPDATE profiles SET plan = 'pro' WHERE id = '${targetUser.id}';`);
    } else {
        console.log("✅ SUCESSO! Usuário promovido a PRO.");
    }
}

run();
