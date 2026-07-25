"use client";

import { useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { createEventAction } from "@/app/actions/eventActions";
import { GLOBAL_LABEL } from "@/lib/constants";
import type { Department } from "@/types/database";

export function EventFormModal({ departments }: { departments: Department[] }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        <Plus className="h-4 w-4" />
        Novo evento
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Novo evento</h2>
          <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form
          ref={formRef}
          action={async (formData) => {
            setPending(true);
            setError(null);
            try {
              await createEventAction(formData);
              formRef.current?.reset();
              setOpen(false);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Erro ao criar evento.");
            } finally {
              setPending(false);
            }
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-medium text-slate-500">Título</label>
            <input
              name="title"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Descrição</label>
            <textarea
              name="description"
              rows={2}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500">Início</label>
              <input
                type="datetime-local"
                name="start_date"
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Fim</label>
              <input
                type="datetime-local"
                name="end_date"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Local</label>
            <input
              name="location"
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
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              {pending ? "A criar..." : "Criar evento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
