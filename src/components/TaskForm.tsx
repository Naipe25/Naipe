"use client";

import { useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { createTaskAction } from "@/app/actions/taskActions";
import { GLOBAL_LABEL } from "@/lib/constants";
import type { Department, ProfileWithDepartment } from "@/types/database";

export function TaskForm({
  departments,
  profiles,
}: {
  departments: Department[];
  profiles: ProfileWithDepartment[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        <Plus className="h-4 w-4" />
        Nova tarefa
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Nova tarefa</h2>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form
        ref={formRef}
        action={async (formData) => {
          setPending(true);
          try {
            await createTaskAction(formData);
            formRef.current?.reset();
            setOpen(false);
          } finally {
            setPending(false);
          }
        }}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-500">Título</label>
          <input
            name="title"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-500">Descrição</label>
          <textarea
            name="description"
            rows={3}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">Departamento</label>
          <select
            name="department_id"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">{GLOBAL_LABEL}</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">Responsável</label>
          <select
            name="assigned_to"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Sem responsável</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name ?? p.email}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">Prazo</label>
          <input
            type="date"
            name="due_date"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-end justify-end sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            {pending ? "A criar..." : "Criar tarefa"}
          </button>
        </div>
      </form>
    </div>
  );
}
