import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';


const playerSupabase = createClient(
    process.env.PUBLIC_PROJECT_URL,
    process.env.PUBLIC_ANON_API_KEY
);

export { playerSupabase };