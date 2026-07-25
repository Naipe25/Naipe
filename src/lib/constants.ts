import type { TaskStatus, UserRole, DocumentCategory } from "@/types/database";

export const ROLE_LABELS: Record<UserRole, string> = {
  membro: "Membro",
  coordenador: "Coordenador",
  admin: "Admin",
};

export const ACCOUNT_STATE_LABELS = {
  pending: "Pendente",
  active: "Ativo",
  inactive: "Inativo",
} as const;

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pendente: "Pendente",
  em_progresso: "Em progresso",
  concluida: "Concluída",
};

export const TASK_STATUS_ORDER: TaskStatus[] = [
  "pendente",
  "em_progresso",
  "concluida",
];

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  geral: "Geral",
  layout: "Layout",
};

export const GLOBAL_LABEL = "Geral / Todos os departamentos";
