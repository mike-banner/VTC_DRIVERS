// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Les variables d'environnement Supabase (PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY) sont manquantes dans le fichier .env.",
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
