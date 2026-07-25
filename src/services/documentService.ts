import type { AnySupabaseClient } from "@/lib/supabaseTypes";
import type { AppDocument, DocumentCategory } from "@/types/database";

const DOCUMENT_SELECT =
  "*, department:departments(*), uploader:profiles(id, full_name)";

export async function listDocuments(
  supabase: AnySupabaseClient,
  filters: { departmentId?: string | null; category?: DocumentCategory } = {}
): Promise<AppDocument[]> {
  let query = supabase
    .from("documents")
    .select(DOCUMENT_SELECT)
    .order("created_at", { ascending: false });

  if (filters.departmentId !== undefined) {
    if (filters.departmentId === null) {
      query = query.is("department_id", null);
    } else {
      query = query.eq("department_id", filters.departmentId);
    }
  }
  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as AppDocument[];
}

export async function createDocument(
  supabase: AnySupabaseClient,
  doc: {
    name: string;
    description: string | null;
    category: DocumentCategory;
    department_id: string | null;
    storage_path: string;
    uploaded_by: string;
  }
) {
  const { error } = await supabase.from("documents").insert(doc);
  if (error) throw error;
}

export async function deleteDocument(
  supabase: AnySupabaseClient,
  id: string,
  storagePath: string
) {
  const { error: storageError } = await supabase.storage
    .from("documents")
    .remove([storagePath]);
  if (storageError) throw storageError;

  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw error;
}

export async function getDocumentSignedUrl(
  supabase: AnySupabaseClient,
  storagePath: string
) {
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(storagePath, 60 * 5);
  if (error) throw error;
  return data.signedUrl;
}
