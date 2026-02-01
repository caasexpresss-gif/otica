
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vhoezlyrmkgkddkcfqdk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZob2V6bHlybWtna2Rka2NmcWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MTc3NzksImV4cCI6MjA4NTQ5Mzc3OX0.4gIXoOcGfXhpitFV82P5pOfbXBrHXhOC3Tuk-txpxuA';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function finalizeSetup() {
    console.log('🔧 Finalizing Setup for novo_admin_2...');
    const email = 'novo_admin_2@optisaas.com';
    const password = 'testpassword123';
    
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
