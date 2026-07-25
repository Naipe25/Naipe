import type { AnySupabaseClient } from "@/lib/supabaseTypes";
import type { ContactEntityWithContacts } from "@/types/database";

export async function listContactEntities(
  supabase: AnySupabaseClient
): Promise<ContactEntityWithContacts[]> {
  const { data, error } = await supabase
    .from("contact_entities")
    .select("*, contacts(*)")
    .order("name");

  if (error) throw error;
  return (data ?? []) as unknown as ContactEntityWithContacts[];
}

export async function createContactEntity(
  supabase: AnySupabaseClient,
  entity: { name: string; description: string | null }
) {
  const { data, error } = await supabase
    .from("contact_entities")
    .insert(entity)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteContactEntity(
  supabase: AnySupabaseClient,
  id: string
) {
  const { error } = await supabase
    .from("contact_entities")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function addContact(
  supabase: AnySupabaseClient,
  contact: {
    entity_id: string;
    name: string;
    role: string | null;
    email: string | null;
    phone: string | null;
    notes: string | null;
  }
) {
  const { error } = await supabase.from("contacts").insert(contact);
  if (error) throw error;
}

export async function deleteContact(
  supabase: AnySupabaseClient,
  id: string
) {
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) throw error;
}
