import type { AnySupabaseClient } from "@/lib/supabaseTypes";
import type {
  TaskComment,
  TaskAttachment,
  TaskStatus,
  TaskWithRelations,
} from "@/types/database";

const TASK_SELECT =
  "*, department:departments(*), creator:profiles!tasks_created_by_fkey(id, full_name, avatar_color), assignee:profiles!tasks_assigned_to_fkey(id, full_name, avatar_color)";

export async function listTasks(
  supabase: AnySupabaseClient,
  filters: { departmentId?: string | null; status?: TaskStatus } = {}
): Promise<TaskWithRelations[]> {
  let query = supabase
    .from("tasks")
    .select(TASK_SELECT)
    .order("created_at", { ascending: false });

  if (filters.departmentId !== undefined) {
    if (filters.departmentId === null) {
      query = query.is("department_id", null);
    } else {
      query = query.eq("department_id", filters.departmentId);
    }
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as TaskWithRelations[];
}

export async function getTask(
  supabase: AnySupabaseClient,
  id: string
): Promise<TaskWithRelations | null> {
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_SELECT)
    .eq("id", id)
    .single();

  if (error) return null;
  return data as unknown as TaskWithRelations;
}

export async function createTask(
  supabase: AnySupabaseClient,
  task: {
    title: string;
    description: string | null;
    department_id: string | null;
    assigned_to: string | null;
    due_date: string | null;
    created_by: string;
  }
) {
  const { error } = await supabase.from("tasks").insert(task);
  if (error) throw error;
}

export async function updateTaskStatus(
  supabase: AnySupabaseClient,
  id: string,
  status: TaskStatus
) {
  const { error } = await supabase
    .from("tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function updateTask(
  supabase: AnySupabaseClient,
  id: string,
  updates: Partial<{
    title: string;
    description: string | null;
    department_id: string | null;
    assigned_to: string | null;
    due_date: string | null;
    status: TaskStatus;
  }>
) {
  const { error } = await supabase
    .from("tasks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteTask(supabase: AnySupabaseClient, id: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}

export async function listComments(
  supabase: AnySupabaseClient,
  taskId: string
): Promise<TaskComment[]> {
  const { data, error } = await supabase
    .from("task_comments")
    .select("*, author:profiles(id, full_name, avatar_color)")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as TaskComment[];
}

export async function addComment(
  supabase: AnySupabaseClient,
  taskId: string,
  authorId: string,
  content: string
) {
  const { error } = await supabase
    .from("task_comments")
    .insert({ task_id: taskId, author_id: authorId, content });
  if (error) throw error;
}

export async function listAttachments(
  supabase: AnySupabaseClient,
  taskId: string
): Promise<TaskAttachment[]> {
  const { data, error } = await supabase
    .from("task_attachments")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as TaskAttachment[];
}

export async function addAttachment(
  supabase: AnySupabaseClient,
  attachment: {
    task_id: string;
    file_name: string;
    storage_path: string;
    uploaded_by: string;
  }
) {
  const { error } = await supabase
    .from("task_attachments")
    .insert(attachment);
  if (error) throw error;
}

export async function deleteAttachment(
  supabase: AnySupabaseClient,
  id: string,
  storagePath: string
) {
  const { error: storageError } = await supabase.storage
    .from("task-attachments")
    .remove([storagePath]);
  if (storageError) throw storageError;

  const { error } = await supabase
    .from("task_attachments")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function getAttachmentSignedUrl(
  supabase: AnySupabaseClient,
  storagePath: string
) {
  const { data, error } = await supabase.storage
    .from("task-attachments")
    .createSignedUrl(storagePath, 60 * 5);
  if (error) throw error;
  return data.signedUrl;
}
