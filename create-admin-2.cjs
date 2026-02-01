
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vhoezlyrmkgkddkcfqdk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZob2V6bHlybWtna2Rka2NmcWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MTc3NzksImV4cCI6MjA4NTQ5Mzc3OX0.4gIXoOcGfXhpitFV82P5pOfbXBrHXhOC3Tuk-txpxuA';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createAdmin2() {
    console.log('🚀 Creating Fresh Admin User (2)...');
    const email = 'novo_admin_2@optisaas.com';
    const password = 'testpassword123';
    
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
