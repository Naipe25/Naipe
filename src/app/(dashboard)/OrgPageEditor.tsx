"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { updateOrgPage } from "@/app/actions/orgActions";

export function OrgPageEditor({
  title,
  body,
  canEdit,
}: {
  title: string;
  body: string;
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          {canEdit && (
            <button
              onClick={() => setEditing(true)}
              className="flex shrink-0 items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </button>
          )}
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
          {body}
        </p>
      </div>
    );
  }

  return (
    <form
      action={async (formData) => {
        await updateOrgPage(formData);
        setEditing(false);
      }}
      className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label className="block text-xs font-medium text-slate-500">Título</label>
        <input
          name="title"
          defaultValue={title}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500">Texto</label>
        <textarea
          name="body"
          defaultValue={body}
          rows={8}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
