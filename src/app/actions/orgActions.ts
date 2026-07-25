"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getCurrentProfile } from "@/services/profileService";
import { updateOrgPage as updateOrgPageService } from "@/services/orgService";

export async function updateOrgPage(formData: FormData) {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile || profile.role !== "admin") {
    throw new Error("Sem permissão.");
  }

  const title = String(formData.get("title") ?? "");
  const body = String(formData.get("body") ?? "");

  await updateOrgPageService(supabase, { title, body }, profile.id);
  revalidatePath("/");
}
