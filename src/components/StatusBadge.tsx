import { TASK_STATUS_LABELS } from "@/lib/constants";
import type { TaskStatus } from "@/types/database";

const COLORS: Record<TaskStatus, string> = {
  pendente: "bg-amber-100 text-amber-800",
  em_progresso: "bg-blue-100 text-blue-800",
  concluida: "bg-emerald-100 text-emerald-800",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${COLORS[status]}`}
    >
      {TASK_STATUS_LABELS[status]}
    </span>
  );
}
