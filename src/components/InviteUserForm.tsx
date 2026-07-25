"use client";

import { useRef, useState } from "react";
import { UserPlus, X } from "lucide-react";
import { inviteUserAction } from "@/app/actions/adminActions";
import { ROLE_LABELS } from "@/lib/constants";
import type { Department } from "@/types/database";

export function InviteUserForm({ departments }: { departments: Department[] }) {
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
        <UserPlus className="h-4 w-4" />
        Convidar utilizador
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Convidar utilizador</h2>
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
            await inviteUserAction(formData);
            formRef.current?.reset();
            setOpen(false);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao convidar.");
          } finally {
            setPending(false);
          }
        }}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        <div>
          <label className="block text-xs font-medium text-slate-500">Nome</label>
          <input
            name="full_name"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">Email</label>
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">Cargo</label>
          <select
            name="role"
            defaultValue="membro"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
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
            <option value="">Sem departamento</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
        <div className="flex items-end justify-end sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            {pending ? "A convidar..." : "Enviar convite"}
          </button>
        </div>
      </form>
    </div>
  );
}
