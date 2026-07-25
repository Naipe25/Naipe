import { createClient } from "@/utils/supabase/server";
import { listActiveProfiles } from "@/services/profileService";
import { ROLE_LABELS } from "@/lib/constants";
import type { ProfileWithDepartment } from "@/types/database";

function groupByDepartment(profiles: ProfileWithDepartment[]) {
  const groups = new Map<string, ProfileWithDepartment[]>();
  for (const profile of profiles) {
    const key = profile.department?.name ?? "Sem departamento";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(profile);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export default async function StaffPage() {
  const supabase = await createClient();
  const profiles = await listActiveProfiles(supabase);
  const groups = groupByDepartment(profiles);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Staff</h1>
        <p className="text-sm text-slate-500">
          Diretório de membros ativos da Naipe, agrupados por departamento.
        </p>
      </div>

      {groups.map(([department, members]) => (
        <div key={department}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {department}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: member.avatar_color }}
                >
                  {(member.full_name ?? member.email ?? "?").charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {member.full_name ?? member.email}
                  </p>
                  <p className="text-xs text-slate-500">{ROLE_LABELS[member.role]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {profiles.length === 0 && (
        <p className="text-sm text-slate-500">Ainda não há membros ativos.</p>
      )}
    </div>
  );
}
