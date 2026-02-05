
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou VITE_SUPABASE_ANON_KEY) precisam estar definidos nas variáveis de ambiente.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const userId = 'd0e7041f-8939-4467-8739-bb764836ca26'; // ID do admin

async function finalizeSetup() {
    // Pegar senha do ambiente ou usar placeholder seguro (idealmente nunca hardcoded)
    const password = process.env.ADMIN_PASSWORD;

    if (!password) {
        console.error('Erro: ADMIN_PASSWORD não definida.');
        process.exit(1);
    }
    console.log('🔧 Finalizing Setup for novo_admin_2...');
    const email = 'novo_admin_2@optisaas.com';
    
    // 1. Sign In
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (authError || !authData.user) {
        console.log('❌ Login Failed:', authError?.message);
        return;
    }
    console.log('✅ Logged in as:', authData.user.id);

    // 2. Insert Tenant
    console.log('🏢 Creating Tenant (Retrying)...');
    const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .insert([{ name: 'Otica Modelo Final', plan: 'PRO' }])
        .select()
        .single();
    
    if (tenantError) {
        console.error('❌ Tenant Insert Failed:', tenantError.message);
        if (tenantError.message.includes('plan')) {
             console.log('⚠️ CRITICAL: The "plan" column is missing. RUN THE SQL SCRIPT!');
        } else if (tenantError.message.includes('policy')) {
             console.log('⚠️ CRITICAL: RLS Policy blocking. RUN THE SQL SCRIPT!');
        }
        return;
    }
    console.log('✅ Tenant Created:', tenantData.id);

    // 3. Insert Profile
    console.log('👤 Creating Profile...');
    const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
            id: authData.user.id,
            name: 'Admin User Final',
            tenant_id: tenantData.id,
            role: 'OWNER'
        }]);

    if (profileError) {
        console.error('❌ Profile Insert Failed:', profileError.message);
    } else {
        console.log('🎉 SUCCESS! User is fully configured. You can login via Browser now.');
    }
}

finalizeSetup();
