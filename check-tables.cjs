
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkTables() {
    console.log('🔍 Checking tables...');
    
    // Check prescriptions table
    const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .limit(1);

    if (error) {
        console.error('❌ Prescriptions table error:', error.message);
    } else {
        console.log('✅ Prescriptions table exists!');
    }

    // Check customer address column type (indirectly by checking a row)
    const { data: custData, error: custError } = await supabase
        .from('customers')
        .select('address')
        .limit(1);
    
    if (custData && custData.length > 0) {
        console.log('ℹ️ Sample Address:', typeof custData[0].address, custData[0].address);
    }
}

checkTables();
