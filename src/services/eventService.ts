import type { AnySupabaseClient } from "@/lib/supabaseTypes";
import type { AppEvent } from "@/types/database";

const EVENT_SELECT = "*, department:departments(*)";

export async function listEvents(
  supabase: AnySupabaseClient,
  filters: { departmentId?: string | null } = {}
): Promise<AppEvent[]> {
  let query = supabase
    .from("events")
    .select(EVENT_SELECT)
    .order("start_date", { ascending: true });

  if (filters.departmentId !== undefined) {
    if (filters.departmentId === null) {
      query = query.is("department_id", null);
    } else {
      query = query.eq("department_id", filters.departmentId);
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as AppEvent[];
}

export async function createEvent(
  supabase: AnySupabaseClient,
  event: {
    title: string;
    description: string | null;
    start_date: string;
    end_date: string | null;
    location: string | null;
    department_id: string | null;
    created_by: string;
  }
) {
  const { error } = await supabase.from("events").insert(event);
  if (error) throw error;
}

export async function updateEvent(
  supabase: AnySupabaseClient,
  id: string,
  updates: Partial<{
    title: string;
    description: string | null;
    start_date: string;
    end_date: string | null;
    location: string | null;
    department_id: string | null;
  }>
) {
  const { error } = await supabase.from("events").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteEvent(supabase: AnySupabaseClient, id: string) {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}
