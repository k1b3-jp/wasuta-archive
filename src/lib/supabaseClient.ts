import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
	throw new Error("SUPABASE_URL is not defined in your environment.");
}
if (!supabaseKey) {
	throw new Error("SUPABASE_KEY is not defined in your environment.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
