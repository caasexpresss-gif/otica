require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou VITE_SUPABASE_ANON_KEY) precisam estar definidos nas variáveis de ambiente.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createAdmin() {
    console.log('🚀 Creating Fresh Admin User...');
    const email = 'admin@otica.com';
    const password = process.env.ADMIN_PASSWORD || 'MudeEstaSenha123!';
    
    // 1. SignUp
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
    });

    if (authError) {
        console.log('⚠️ SignUp Error:', authError.message);
        return;
    }
    console.log('✅ User Created:', authData.user?.id);

    if (!authData.user) return;

    // 2. Insert Tenant
    console.log('🏢 Creating Tenant...');
    const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .insert([{ name: 'Otica Modelo 2', plan: 'PRO' }])
        .select()
        .single();
    
    if (tenantError) {
        console.error('❌ Tenant Insert Failed (RLS likely):', tenantError.message);
        console.log('💡 TIP: You must run the SQL to fix RLS for this to work!');
        return;
    }
    console.log('✅ Tenant Created:', tenantData.id);

    // 3. Insert Profile
    console.log('👤 Creating Profile...');
    const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
            id: authData.user.id,
            name: 'Admin User 2',
            tenant_id: tenantData.id,
            role: 'OWNER'
        }]);

    if (profileError) {
        console.error('❌ Profile Insert Failed:', profileError.message);
    } else {
        console.log('✅ Profile Created!');
    }
}

createAdmin2();
