
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vhoezlyrmkgkddkcfqdk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZob2V6bHlybWtna2Rka2NmcWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MTc3NzksImV4cCI6MjA4NTQ5Mzc3OX0.4gIXoOcGfXhpitFV82P5pOfbXBrHXhOC3Tuk-txpxuA';

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
