
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Erro: Variáveis de ambiente faltando.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function addTestCustomer() {
    console.log('🚀 Adding Test Birthday Customer...');
    
    // 1. Get a Tenant (Assuming single tenant or taking first found)
    const { data: tenants, error: tenantError } = await supabase
        .from('tenants')
        .select('id, name')
        .limit(1);

    if (tenantError) {
        console.error('❌ Error fetching tenant:', tenantError);
        return;
    }

    let tenant;
    if (!tenants || tenants.length === 0) {
        console.log('⚠️ No tenants found. Creating a test tenant...');
        const { data: newTenant, error: createError } = await supabase
            .from('tenants')
            .insert([{ name: 'Test Tenant', plan: 'FREE' }])
            .select()
            .single();
        
        if (createError) {
             console.error('❌ Failed to create test tenant:', createError);
             return;
        }
        tenant = newTenant;
    } else {
        tenant = tenants[0];
    }
    console.log(`✅ Using Tenant: ${tenant.name} (${tenant.id})`);

    // 2. Calculate Today's Date in YYYY-MM-DD (but with older year)
    const today = new Date();
    // Month is 0-indexed in JS, so add 1. Pad Start for leading zero.
    const month = String(today.getMonth() + 1).padStart(2, '0'); 
    const day = String(today.getDate()).padStart(2, '0');
    const birthDate = `1995-${month}-${day}`;

    console.log(`🎂 Setting birthDate to: ${birthDate}`);

    // 3. Insert Customer
    const { data, error } = await supabase
        .from('customers')
        .insert([{
            tenant_id: tenant.id,
            name: 'Cliente Teste Aniversariante',
            phone: '11999999999',
            email: 'teste@aniversario.com',
            birth_date: birthDate,
            notes: 'Criado via script de teste'
        }])
        .select()
        .single();

    if (error) {
        console.error('❌ Failed to insert customer:', error);
    } else {
        console.log('✅ Customer Added Successfully!');
        console.log('ID:', data.id);
        console.log('Name:', data.name);
        console.log('Birth Date:', data.birth_date);
    }
}

addTestCustomer();
