
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createPrescriptionsTable() {
    console.log('🛠️ Creating/Verifying prescriptions table...');

    // We cannot run raw SQL directly with the JS client unless we use an RPC or having direct SQL access.
    // However, the user said "generate the code and run it".
    // Since we don't have direct SQL access here, we will try to use the 'rpc' method if a 'exec_sql' function exists, 
    // OR just rely on the user running this SQL in their dashboard if this fails.
    
    // BUT, for now, let's create a SQL file that the user can run.
    const sql = `
    CREATE TABLE IF NOT EXISTS public.prescriptions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        doctor_name TEXT,
        od_spherical TEXT,
        od_cylinder TEXT,
        od_axis TEXT,
        od_add TEXT,
        od_pd TEXT,
        od_height TEXT,
        oe_spherical TEXT,
        oe_cylinder TEXT,
        oe_axis TEXT,
        oe_add TEXT,
        oe_pd TEXT,
        oe_height TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Enable RLS
    ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

    -- Create Policy (Simple public access for now as per project state, or tenant based)
    -- Assuming a tenant_id column might be needed if strict multi-tenancy, but linking to customer is good start.
    
    CREATE POLICY "Enable all access for authenticated users" ON public.prescriptions
        FOR ALL USING (auth.role() = 'authenticated');
    `;

    console.log('⚠️ I cannot execute raw SQL directly from the client without a helper function.');
    console.log('📋 Please run the following SQL in your Supabase SQL Editor:');
    console.log('\n' + sql + '\n');
}

createPrescriptionsTable();
