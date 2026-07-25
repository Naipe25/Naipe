"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getCurrentProfile, updateOwnProfile } from "@/services/profileService";

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) throw new Error("Sem sessão.");

  const fullName = String(formData.get("full_name") ?? "").trim();
  const avatarColor = String(formData.get("avatar_color") ?? profile.avatar_color);

  await updateOwnProfile(supabase, profile.id, {
    full_name: fullName || undefined,
    avatar_color: avatarColor,
  });

  revalidatePath("/perfil");
  revalidatePath("/");
}
