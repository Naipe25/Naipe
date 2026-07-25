export type UserRole = "membro" | "coordenador" | "admin";
export type AccountState = "pending" | "active" | "inactive";
export type TaskStatus = "pendente" | "em_progresso" | "concluida";
export type DocumentCategory = "geral" | "layout";

export interface Department {
  id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  department_id: string | null;
  account_state: AccountState;
  avatar_color: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileWithDepartment extends Profile {
  department: Department | null;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  department_id: string | null;
  created_by: string;
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskWithRelations extends Task {
  department: Department | null;
  creator: Pick<Profile, "id" | "full_name" | "avatar_color"> | null;
  assignee: Pick<Profile, "id" | "full_name" | "avatar_color"> | null;
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author: Pick<Profile, "id" | "full_name" | "avatar_color"> | null;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  file_name: string;
  storage_path: string;
  uploaded_by: string;
  created_at: string;
}

export interface AppDocument {
  id: string;
  name: string;
  description: string | null;
  category: DocumentCategory;
  department_id: string | null;
  storage_path: string;
  uploaded_by: string;
  created_at: string;
  department: Department | null;
  uploader: Pick<Profile, "id" | "full_name"> | null;
}

export interface AppEvent {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  department_id: string | null;
  created_by: string;
  created_at: string;
  department: Department | null;
}

export interface ContactEntity {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Contact {
  id: string;
  entity_id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

export interface ContactEntityWithContacts extends ContactEntity {
  contacts: Contact[];
}

export interface OrgPage {
  id: boolean;
  title: string;
  body: string;
  updated_at: string;
  updated_by: string | null;
}
