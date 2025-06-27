import { createClient } from "@supabase/supabase-js";
const supabaseURL = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseURL || !anonKey) {
	console.error("Supabase Url or Anon key is missing");
}

if (!createClient) {
	console.error("createClient is not working ");
}
export const supabase = createClient(supabaseURL, anonKey);
