const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou VITE_SUPABASE_ANON_KEY) precisam estar definidos nas variáveis de ambiente.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testRegister() {
    console.log('🚀 Starting Registration Test...');
    const email = `reg_test_${Date.now()}@test.com`;
    const password = 'password123';
    const storeName = `Otica Teste ${Date.now()}`;
    const userName = 'Test User';

    try {
        // 1. SignUp
        console.log(`1. Signing Up as ${email}...`);
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password
        });

        if (authError) {
            console.error('❌ SignUp Failed:', authError);
            return;
        }
        if (!authData.user) {
            console.error('❌ SignUp returned no user');
            return;
        }
        console.log('✅ SignUp Success. User ID:', authData.user.id);

        // 2. Insert Tenant
        console.log(`2. Inserting Tenant '${storeName}'...`);
        // Note: checking RLS here. Usually 'authenticated' users can insert.
        const { data: tenantData, error: tenantError } = await supabase
            .from('tenants')
            .insert([{ name: storeName, plan: 'FREE' }])
            .select()
            .single();

        if (tenantError) {
            console.error('❌ Tenant Insert Failed (RLS likely):', tenantError);
            return;
        }
        console.log('✅ Tenant Insert Success:', tenantData.id);

        // 3. Insert Profile
        console.log(`3. Inserting Profile...`);
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
                id: authData.user.id,
                name: userName,
                tenant_id: tenantData.id,
                role: 'OWNER'
            }]);

        if (profileError) {
            console.error('❌ Profile Insert Failed:', profileError);
            return;
        }
        console.log('✅ Registration Flow Complete!');

    } catch (e) {
        console.error('⚠️ Unexpected Error:', e);
    }
}

testRegister();
