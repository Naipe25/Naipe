import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente com a service role key: ignora RLS. Só pode ser usado em código
// server-only (Server Actions/Route Handlers) para operações de admin
// (convidar utilizadores, mudar role/department/account_state de outrem).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
