import type { AnySupabaseClient } from "@/lib/supabaseTypes";
import type { ProfileWithDepartment } from "@/types/database";

export async function getCurrentProfile(
  supabase: AnySupabaseClient
): Promise<ProfileWithDepartment | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*, department:departments(*)")
    .eq("id", user.id)
    .single();

  if (error) return null;
  return data as ProfileWithDepartment;
}

export async function listActiveProfiles(
  supabase: AnySupabaseClient
): Promise<ProfileWithDepartment[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*, department:departments(*)")
    .eq("account_state", "active")
    .order("full_name");

  if (error) throw error;
  return (data ?? []) as ProfileWithDepartment[];
}

export async function listAllProfiles(
  supabase: AnySupabaseClient
): Promise<ProfileWithDepartment[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*, department:departments(*)")
    .order("full_name");

  if (error) throw error;
  return (data ?? []) as ProfileWithDepartment[];
}

export async function updateOwnProfile(
  supabase: AnySupabaseClient,
  userId: string,
  updates: { full_name?: string; avatar_color?: string }
) {
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) throw error;
}
