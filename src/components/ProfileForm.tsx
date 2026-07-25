"use client";

import { useRef, useState } from "react";
import { updateProfileAction } from "@/app/actions/profileActions";
import type { ProfileWithDepartment } from "@/types/database";

const COLORS = [
  "#6366f1",
  "#ec4899",
  "#f97316",
  "#22c55e",
  "#0ea5e9",
  "#a855f7",
  "#ef4444",
  "#14b8a6",
];

export function ProfileForm({ profile }: { profile: ProfileWithDepartment }) {
  const [color, setColor] = useState(profile.avatar_color);
  const [saved, setSaved] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        formData.set("avatar_color", color);
        await updateProfileAction(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div>
        <label className="block text-xs font-medium text-slate-500">Nome</label>
        <input
          name="full_name"
          defaultValue={profile.full_name ?? ""}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <p className="block text-xs font-medium text-slate-500">Cor do avatar</p>
        <div className="mt-2 flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-7 w-7 rounded-full ${color === c ? "ring-2 ring-offset-2 ring-slate-900" : ""}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Guardar
        </button>
        {saved && <span className="text-xs text-emerald-600">Guardado.</span>}
      </div>
    </form>
  );
}
