import type { AnySupabaseClient } from "@/lib/supabaseTypes";
import type { Department } from "@/types/database";

export async function listDepartments(
  supabase: AnySupabaseClient
): Promise<Department[]> {
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .order("name");

  if (error) throw error;
  return (data ?? []) as Department[];
}

export async function createDepartment(
  supabase: AnySupabaseClient,
  name: string
) {
  const { error } = await supabase.from("departments").insert({ name });
  if (error) throw error;
}

export async function renameDepartment(
  supabase: AnySupabaseClient,
  id: string,
  name: string
) {
  const { error } = await supabase
    .from("departments")
    .update({ name })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteDepartment(
  supabase: AnySupabaseClient,
  id: string
) {
  const { error } = await supabase.from("departments").delete().eq("id", id);
  if (error) throw error;
}
