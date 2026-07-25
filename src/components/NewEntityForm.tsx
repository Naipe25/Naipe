"use client";

import { useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { createEntityAction } from "@/app/actions/contactActions";

export function NewEntityForm() {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        <Plus className="h-4 w-4" />
        Nova entidade
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Nova entidade</h2>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form
        ref={formRef}
        action={async (formData) => {
          await createEntityAction(formData);
          formRef.current?.reset();
          setOpen(false);
        }}
        className="space-y-3"
      >
        <div>
          <label className="block text-xs font-medium text-slate-500">Nome</label>
          <input
            name="name"
            required
            placeholder="Ex: Empresa X, Orador Y..."
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
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Criar
          </button>
        </div>
      </form>
    </div>
  );
}
