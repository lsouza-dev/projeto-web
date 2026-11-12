import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://lzlgxocaxnbrqysuvqmn.supabase.co';

// Prioriza a chave válida registrada para o projeto
const supabaseKey = process.env.SUPABASE_KEY 
    || process.env.SUPABASE_PUBLISHABLE_KEY 
    || process.env.SUPABASE_SECRET_KEY 
    || 'sb_publishable_0ECBZ10gCquZnbb-q2AQyg_S2kF5i4w';

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});

export default supabase;
