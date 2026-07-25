"use client";

import { useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { uploadDocumentAction } from "@/app/actions/documentActions";
import { DOCUMENT_CATEGORY_LABELS, GLOBAL_LABEL } from "@/lib/constants";
import type { Department } from "@/types/database";

export function DocumentUploadForm({ departments }: { departments: Department[] }) {
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
        Novo documento
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Novo documento</h2>
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
            await uploadDocumentAction(formData);
            formRef.current?.reset();
            setOpen(false);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao enviar.");
          } finally {
            setPending(false);
          }
        }}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-500">Nome</label>
          <input
            name="name"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-500">Descrição</label>
          <textarea
            name="description"
            rows={2}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">Categoria</label>
          <select
            name="category"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
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
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-500">Ficheiro</label>
          <input
            type="file"
            name="file"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
        <div className="flex items-end justify-end sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            {pending ? "A enviar..." : "Enviar documento"}
          </button>
        </div>
      </form>
    </div>
  );
}
