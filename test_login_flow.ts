
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vhoezlyrmkgkddkcfqdk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZob2V6bHlybWtna2Rka2NmcWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MTc3NzksImV4cCI6MjA4NTQ5Mzc3OX0.4gIXoOcGfXhpitFV82P5pOfbXBrHXhOC3Tuk-txpxuA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    console.log("1. Attempting login...");
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@optisaas.com',
        password: 'admin123'
    });

    if (error) {
        console.error("❌ Login Failed:", error.message);
        return;
    }

    console.log("✅ Login Successful. User ID:", data.session?.user.id);
    const userId = data.session?.user.id;

    if (!userId) {
        console.error("❌ User ID missing from session.");
        return;
    }

    console.log("2. Fetching Profile...");
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (profileError) {
        console.error("❌ Profile Fetch Failed:", profileError);
        return;
    }

    console.log("✅ Profile Found:", profile.name, "| Tenant ID:", profile.tenant_id);

    console.log("3. Fetching Tenant...");
    const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', profile.tenant_id)
        .single();

    if (tenantError) {
        console.error("❌ Tenant Fetch Failed:", tenantError);
        return;
    }

    console.log("✅ Tenant Found:", tenant.name);
    console.log("🎉 FULL LOGFLOW SUCCESSFUL");
}

testLogin();
