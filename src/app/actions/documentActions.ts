"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { createClient } from "@/utils/supabase/server";
import { getCurrentProfile } from "@/services/profileService";
import * as documentService from "@/services/documentService";
import type { DocumentCategory } from "@/types/database";

async function requireActiveProfile() {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile || profile.account_state !== "active") {
    throw new Error("Sem permissão.");
  }
  return { supabase, profile };
}

export async function uploadDocumentAction(formData: FormData) {
  const { supabase, profile } = await requireActiveProfile();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "") || null;
  const category = (String(formData.get("category") ?? "geral") as DocumentCategory);
  const departmentId = String(formData.get("department_id") ?? "") || null;
  const file = formData.get("file") as File | null;

  if (!name || !file || file.size === 0) {
    throw new Error("Nome e ficheiro são obrigatórios.");
  }

  const folder = departmentId ?? "global";
  const storagePath = `${folder}/${randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, file);
  if (uploadError) throw uploadError;

  await documentService.createDocument(supabase, {
    name,
    description,
    category,
    department_id: departmentId,
    storage_path: storagePath,
    uploaded_by: profile.id,
  });

  revalidatePath("/documentos");
}

export async function deleteDocumentAction(id: string, storagePath: string) {
  const { supabase } = await requireActiveProfile();
  await documentService.deleteDocument(supabase, id, storagePath);
  revalidatePath("/documentos");
}

export async function getDocumentUrlAction(storagePath: string) {
  const { supabase } = await requireActiveProfile();
  return documentService.getDocumentSignedUrl(supabase, storagePath);
}
