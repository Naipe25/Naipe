import type { AnySupabaseClient } from "@/lib/supabaseTypes";
import type { OrgPage } from "@/types/database";

export async function getOrgPage(
  supabase: AnySupabaseClient
): Promise<OrgPage | null> {
  const { data, error } = await supabase
    .from("org_page")
    .select("*")
    .eq("id", true)
    .single();

  if (error) return null;
  return data as OrgPage;
}

export async function updateOrgPage(
  supabase: AnySupabaseClient,
  updates: { title: string; body: string },
  userId: string
) {
  const { error } = await supabase
    .from("org_page")
    .update({ ...updates, updated_by: userId, updated_at: new Date().toISOString() })
    .eq("id", true);

  if (error) throw error;
}
