import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://lzlgxocaxnbrqysuvqmn.supabase.co';
const supabaseKey = process.env.SUPABASE_SECRET_KEY 
    || process.env.SUPABASE_SERVICE_ROLE_KEY 
    || process.env.SUPABASE_PUBLISHABLE_KEY 
    || 'sb_secret_0UcV9ZFZEdoOY4maKmNqiw_GZNlo6DB';

if (!supabaseUrl || !supabaseKey) {
    console.error('ATENÇÃO: Variáveis SUPABASE_URL ou SUPABASE_SECRET_KEY não encontradas!');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});

export default supabase;
