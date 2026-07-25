"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserAction } from "@/app/actions/adminActions";
import { ACCOUNT_STATE_LABELS, ROLE_LABELS } from "@/lib/constants";
import type {
  AccountState,
  Department,
  ProfileWithDepartment,
  UserRole,
} from "@/types/database";

function AdminUserRow({
  profile,
  departments,
}: {
  profile: ProfileWithDepartment;
  departments: Department[];
}) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(profile.role);
  const [departmentId, setDepartmentId] = useState(profile.department_id ?? "");
  const [accountState, setAccountState] = useState<AccountState>(profile.account_state);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("user_id", profile.id);
      formData.set("role", role);
      formData.set("department_id", departmentId);
      formData.set("account_state", accountState);
      await updateUserAction(formData);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr>
      <td className="px-4 py-2.5 font-medium text-slate-900">{profile.full_name ?? "—"}</td>
      <td className="px-4 py-2.5 text-slate-600">{profile.email}</td>
      <td className="px-4 py-2.5">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
        >
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-2.5">
        <select
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
        >
          <option value="">Sem departamento</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-2.5">
        <select
          value={accountState}
          onChange={(e) => setAccountState(e.target.value as AccountState)}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
        >
          {Object.entries(ACCOUNT_STATE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-2.5 text-right">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {saving ? "..." : "Guardar"}
        </button>
      </td>
    </tr>
  );
}

export function AdminUserTable({
  profiles,
  departments,
}: {
  profiles: ProfileWithDepartment[];
  departments: Department[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-2.5">Nome</th>
            <th className="px-4 py-2.5">Email</th>
            <th className="px-4 py-2.5">Cargo</th>
            <th className="px-4 py-2.5">Departamento</th>
            <th className="px-4 py-2.5">Estado</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {profiles.map((profile) => (
            <AdminUserRow key={profile.id} profile={profile} departments={departments} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
