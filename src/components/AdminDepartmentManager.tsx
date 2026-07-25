"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import {
  createDepartmentAction,
  deleteDepartmentAction,
  renameDepartmentAction,
} from "@/app/actions/adminActions";
import type { Department } from "@/types/database";

function DepartmentRow({ department }: { department: Department }) {
  const router = useRouter();
  const [name, setName] = useState(department.name);
  const [saving, setSaving] = useState(false);

  async function handleRename() {
    if (name.trim() === department.name) return;
    setSaving(true);
    const formData = new FormData();
    formData.set("id", department.id);
    formData.set("name", name.trim());
    await renameDepartmentAction(formData);
    setSaving(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Apagar o departamento "${department.name}"?`)) return;
    await deleteDepartmentAction(department.id);
    router.refresh();
  }

  return (
    <li className="flex items-center gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleRename}
        disabled={saving}
        className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
      />
      <button onClick={handleDelete} className="text-slate-400 hover:text-red-600">
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}

export function AdminDepartmentManager({ departments }: { departments: Department[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">Departamentos</h2>
      <ul className="space-y-2">
        {departments.map((d) => (
          <DepartmentRow key={d.id} department={d} />
        ))}
      </ul>
      <form
        ref={formRef}
        action={async (formData) => {
          await createDepartmentAction(formData);
          formRef.current?.reset();
          router.refresh();
        }}
        className="mt-3 flex gap-2"
      >
        <input
          name="name"
          required
          placeholder="Novo departamento"
          className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
        <button
          type="submit"
          className="flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar
        </button>
      </form>
    </div>
  );
}
