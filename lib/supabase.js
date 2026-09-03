import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nodijpmukvclftlegyyu.supabase.co';
const supabaseKey = 'sb_publishable_RoTpordkjKkCsddiof-Y5g_PB3bGtP2';

export const supabase = createClient(supabaseUrl, supabaseKey);
