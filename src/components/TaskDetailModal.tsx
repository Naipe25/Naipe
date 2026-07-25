"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Paperclip, Trash2, Download } from "lucide-react";
import {
  updateTaskStatusAction,
  deleteTaskAction,
  addCommentAction,
  uploadAttachmentAction,
  deleteAttachmentAction,
  getAttachmentUrlAction,
  getTaskDetailsAction,
} from "@/app/actions/taskActions";
import { StatusBadge } from "@/components/StatusBadge";
import { TASK_STATUS_LABELS, GLOBAL_LABEL } from "@/lib/constants";
import type {
  TaskAttachment,
  TaskComment,
  TaskStatus,
  TaskWithRelations,
} from "@/types/database";

export function TaskDetailModal({
  task,
  onClose,
}: {
  task: TaskWithRelations;
  onClose: () => void;
}) {
  const router = useRouter();
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const commentFormRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    const details = await getTaskDetailsAction(task.id);
    setComments(details.comments);
    setAttachments(details.attachments);
    setLoading(false);
  }

  useEffect(() => {
    let ignore = false;

    getTaskDetailsAction(task.id).then((details) => {
      if (ignore) return;
      setComments(details.comments);
      setAttachments(details.attachments);
      setLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [task.id]);

  async function handleStatusChange(status: TaskStatus) {
    await updateTaskStatusAction(task.id, status);
    router.refresh();
  }

  async function handleDeleteTask() {
    if (!confirm("Apagar esta tarefa?")) return;
    await deleteTaskAction(task.id);
    router.refresh();
    onClose();
  }

  async function handleViewAttachment(storagePath: string) {
    const url = await getAttachmentUrlAction(storagePath);
    window.open(url, "_blank");
  }

  async function handleDeleteAttachment(id: string, storagePath: string) {
    await deleteAttachmentAction(id, storagePath);
    refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{task.title}</h2>
            <p className="mt-1 text-xs text-slate-500">
              {task.department?.name ?? GLOBAL_LABEL}
              {task.assignee ? ` · Responsável: ${task.assignee.full_name}` : ""}
              {task.due_date ? ` · Prazo: ${task.due_date}` : ""}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {task.description && (
            <p className="text-sm text-slate-600">{task.description}</p>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Estado:</span>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs"
            >
              {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <StatusBadge status={task.status} />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Anexos
              </h3>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                <Paperclip className="h-3.5 w-3.5" />
                Anexar
              </button>
              <form
                action={async (formData) => {
                  await uploadAttachmentAction(formData);
                  refresh();
                }}
              >
                <input type="hidden" name="task_id" value={task.id} />
                <input
                  ref={fileInputRef}
                  type="file"
                  name="file"
                  className="hidden"
                  onChange={(e) => e.target.form?.requestSubmit()}
                />
              </form>
            </div>
            {!loading && attachments.length === 0 && (
              <p className="text-xs text-slate-400">Sem anexos.</p>
            )}
            <ul className="space-y-1.5">
              {attachments.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-1.5 text-xs"
                >
                  <span className="truncate">{a.file_name}</span>
                  <span className="flex shrink-0 gap-2">
                    <button
                      onClick={() => handleViewAttachment(a.storage_path)}
                      className="text-slate-500 hover:text-indigo-600"
                      title="Ver / Download"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAttachment(a.id, a.storage_path)}
                      className="text-slate-500 hover:text-red-600"
                      title="Apagar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Comentários
            </h3>
            <ul className="space-y-2">
              {comments.map((c) => (
                <li key={c.id} className="rounded-md bg-slate-50 p-2.5 text-sm">
                  <p className="text-xs font-medium text-slate-700">
                    {c.author?.full_name ?? "Utilizador"}
                  </p>
                  <p className="text-slate-600">{c.content}</p>
                </li>
              ))}
              {!loading && comments.length === 0 && (
                <p className="text-xs text-slate-400">Sem comentários ainda.</p>
              )}
            </ul>
            <form
              ref={commentFormRef}
              action={async (formData) => {
                await addCommentAction(formData);
                commentFormRef.current?.reset();
                refresh();
              }}
              className="mt-2 flex gap-2"
            >
              <input type="hidden" name="task_id" value={task.id} />
              <input
                name="content"
                required
                placeholder="Escreve um comentário..."
                className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
              />
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Enviar
              </button>
            </form>
          </div>

          <div className="border-t border-slate-100 pt-4 text-right">
            <button
              onClick={handleDeleteTask}
              className="text-xs font-medium text-red-600 hover:text-red-700"
            >
              Apagar tarefa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
