"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { createClient } from "@/utils/supabase/server";
import { getCurrentProfile } from "@/services/profileService";
import * as taskService from "@/services/taskService";
import type { TaskStatus } from "@/types/database";

async function requireActiveProfile() {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile || profile.account_state !== "active") {
    throw new Error("Sem permissão.");
  }
  return { supabase, profile };
}

export async function createTaskAction(formData: FormData) {
  const { supabase, profile } = await requireActiveProfile();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Título é obrigatório.");

  const departmentId = String(formData.get("department_id") ?? "") || null;
  const assignedTo = String(formData.get("assigned_to") ?? "") || null;
  const dueDate = String(formData.get("due_date") ?? "") || null;
  const description = String(formData.get("description") ?? "") || null;

  await taskService.createTask(supabase, {
    title,
    description,
    department_id: departmentId,
    assigned_to: assignedTo,
    due_date: dueDate,
    created_by: profile.id,
  });

  revalidatePath("/tarefas");
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus) {
  const { supabase } = await requireActiveProfile();
  await taskService.updateTaskStatus(supabase, taskId, status);
  revalidatePath("/tarefas");
}

export async function deleteTaskAction(taskId: string) {
  const { supabase } = await requireActiveProfile();
  await taskService.deleteTask(supabase, taskId);
  revalidatePath("/tarefas");
}

export async function addCommentAction(formData: FormData) {
  const { supabase, profile } = await requireActiveProfile();
  const taskId = String(formData.get("task_id") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  if (!taskId || !content) return;

  await taskService.addComment(supabase, taskId, profile.id, content);
  revalidatePath("/tarefas");
}

export async function uploadAttachmentAction(formData: FormData) {
  const { supabase, profile } = await requireActiveProfile();
  const taskId = String(formData.get("task_id") ?? "");
  const file = formData.get("file") as File | null;
  if (!taskId || !file || file.size === 0) return;

  const storagePath = `${taskId}/${randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("task-attachments")
    .upload(storagePath, file);
  if (uploadError) throw uploadError;

  await taskService.addAttachment(supabase, {
    task_id: taskId,
    file_name: file.name,
    storage_path: storagePath,
    uploaded_by: profile.id,
  });

  revalidatePath("/tarefas");
}

export async function deleteAttachmentAction(id: string, storagePath: string) {
  const { supabase } = await requireActiveProfile();
  await taskService.deleteAttachment(supabase, id, storagePath);
  revalidatePath("/tarefas");
}

export async function getAttachmentUrlAction(storagePath: string) {
  const { supabase } = await requireActiveProfile();
  return taskService.getAttachmentSignedUrl(supabase, storagePath);
}

export async function getTaskDetailsAction(taskId: string) {
  const { supabase } = await requireActiveProfile();
  const [comments, attachments] = await Promise.all([
    taskService.listComments(supabase, taskId),
    taskService.listAttachments(supabase, taskId),
  ]);
  return { comments, attachments };
}
