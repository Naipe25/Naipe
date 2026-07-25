"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getCurrentProfile } from "@/services/profileService";
import * as contactService from "@/services/contactService";

async function requireActiveProfile() {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile || profile.account_state !== "active") {
    throw new Error("Sem permissão.");
  }
  return { supabase, profile };
}

export async function createEntityAction(formData: FormData) {
  const { supabase } = await requireActiveProfile();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Nome é obrigatório.");
  const description = String(formData.get("description") ?? "") || null;

  await contactService.createContactEntity(supabase, { name, description });
  revalidatePath("/contactos");
}

export async function deleteEntityAction(id: string) {
  const { supabase } = await requireActiveProfile();
  await contactService.deleteContactEntity(supabase, id);
  revalidatePath("/contactos");
}

export async function addContactAction(formData: FormData) {
  const { supabase } = await requireActiveProfile();
  const entityId = String(formData.get("entity_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!entityId || !name) throw new Error("Nome é obrigatório.");

  await contactService.addContact(supabase, {
    entity_id: entityId,
    name,
    role: String(formData.get("role") ?? "") || null,
    email: String(formData.get("email") ?? "") || null,
    phone: String(formData.get("phone") ?? "") || null,
    notes: String(formData.get("notes") ?? "") || null,
  });
  revalidatePath("/contactos");
}

export async function deleteContactAction(id: string) {
  const { supabase } = await requireActiveProfile();
  await contactService.deleteContact(supabase, id);
  revalidatePath("/contactos");
}
