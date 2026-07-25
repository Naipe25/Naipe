"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getCurrentProfile } from "@/services/profileService";
import * as departmentService from "@/services/departmentService";
import type { AccountState, UserRole } from "@/types/database";

async function requireAdmin() {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile || profile.role !== "admin") {
    throw new Error("Só administradores podem fazer isto.");
  }
  return profile;
}

export async function inviteUserAction(formData: FormData) {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const departmentId = String(formData.get("department_id") ?? "") || null;
  const role = (String(formData.get("role") ?? "membro") as UserRole);

  if (!email) throw new Error("Email é obrigatório.");

  const admin = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
    redirectTo: `${siteUrl}/auth/callback`,
  });
  if (error) throw error;

  // O trigger on_auth_user_created já criou o profile com defaults; atualizamos role/departamento.
  if (data.user) {
    const { error: updateError } = await admin
      .from("profiles")
      .update({ full_name: fullName || null, department_id: departmentId, role })
      .eq("id", data.user.id);
    if (updateError) throw updateError;
  }

  revalidatePath("/admin");
}

export async function updateUserAction(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("user_id") ?? "");
  const role = String(formData.get("role") ?? "") as UserRole;
  const departmentId = String(formData.get("department_id") ?? "") || null;
  const accountState = String(formData.get("account_state") ?? "") as AccountState;

  if (!userId) throw new Error("Utilizador inválido.");

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      role,
      department_id: departmentId,
      account_state: accountState,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (error) throw error;

  revalidatePath("/admin");
}

export async function createDepartmentAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Nome é obrigatório.");

  await departmentService.createDepartment(supabase, name);
  revalidatePath("/admin");
}

export async function renameDepartmentAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;

  await departmentService.renameDepartment(supabase, id, name);
  revalidatePath("/admin");
}

export async function deleteDepartmentAction(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await departmentService.deleteDepartment(supabase, id);
  revalidatePath("/admin");
}
