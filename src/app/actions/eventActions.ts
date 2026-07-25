"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getCurrentProfile } from "@/services/profileService";
import * as eventService from "@/services/eventService";

async function requireActiveProfile() {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile || profile.account_state !== "active") {
    throw new Error("Sem permissão.");
  }
  return { supabase, profile };
}

export async function createEventAction(formData: FormData) {
  const { supabase, profile } = await requireActiveProfile();

  const title = String(formData.get("title") ?? "").trim();
  const startDate = String(formData.get("start_date") ?? "");
  if (!title || !startDate) throw new Error("Título e data são obrigatórios.");

  const description = String(formData.get("description") ?? "") || null;
  const endDate = String(formData.get("end_date") ?? "") || null;
  const location = String(formData.get("location") ?? "") || null;
  const departmentId = String(formData.get("department_id") ?? "") || null;

  await eventService.createEvent(supabase, {
    title,
    description,
    start_date: new Date(startDate).toISOString(),
    end_date: endDate ? new Date(endDate).toISOString() : null,
    location,
    department_id: departmentId,
    created_by: profile.id,
  });

  revalidatePath("/calendario");
  revalidatePath("/timeline");
}

export async function deleteEventAction(id: string) {
  const { supabase } = await requireActiveProfile();
  await eventService.deleteEvent(supabase, id);
  revalidatePath("/calendario");
  revalidatePath("/timeline");
}
