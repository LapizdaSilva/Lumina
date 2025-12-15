import { createClient } from "@supabase/supabase-js";
import AssyncStorage from "@react-native-async-storage/async-storage";

// const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const SUPABASE_URL = 'https://xvhmdvyuodyakmfqxtwq.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aG1kdnl1b2R5YWttZnF4dHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTE0NTMsImV4cCI6MjA3MzE2NzQ1M30.LXXQ0BtKWLv8y7jQ0rB_Umf9rCB_NZxz6BWkUOQyqgM'

export const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: {
        storage: AssyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
