import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://ipxpsxzllgnklqynkymr.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlweHBzeHpsbGdua2xxeW5reW1yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQ4ODE4MSwiZXhwIjoyMDg0MDY0MTgxfQ.Lrrcqbgccw-dqWlppMKKyyDzVDY_zeELKFF6LlDIQAQ';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

async function run() {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);

    if (data && data.length > 0) {
        fs.writeFileSync('user_structure.json', JSON.stringify(data[0], null, 2));
        console.log("Salvo user_structure.json");
    } else {
        console.log("Erro ou vazio:", error);
    }
}

run();
