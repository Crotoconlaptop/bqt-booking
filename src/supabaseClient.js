import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jpappufrtwvzgzwkqote.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwYXBwdWZydHd2emd6d2txb3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NTAzMjcsImV4cCI6MjA1ODAyNjMyN30.XKX41CSp3S1qxFseunBufuFVYZSLaUpW0v_C5Tymnf8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
