"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { TaskDetailModal } from "@/components/TaskDetailModal";
import { GLOBAL_LABEL } from "@/lib/constants";
import type { TaskWithRelations } from "@/types/database";

export function TaskItem({ task }: { task: TaskWithRelations }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left shadow-sm hover:border-indigo-300"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{task.title}</p>
          <p className="truncate text-xs text-slate-500">
            {task.department?.name ?? GLOBAL_LABEL}
            {task.assignee ? ` · ${task.assignee.full_name}` : ""}
            {task.due_date ? ` · Prazo: ${task.due_date}` : ""}
          </p>
        </div>
        <StatusBadge status={task.status} />
      </button>
      {open && <TaskDetailModal task={task} onClose={() => setOpen(false)} />}
    </>
  );
}
