import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getCurrentProfile, listAllProfiles } from "@/services/profileService";
import { listDepartments } from "@/services/departmentService";
import { AdminUserTable } from "@/components/AdminUserTable";
import { AdminDepartmentManager } from "@/components/AdminDepartmentManager";
import { InviteUserForm } from "@/components/InviteUserForm";

export default async function AdminPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  const [profiles, departments] = await Promise.all([
    listAllProfiles(supabase),
    listDepartments(supabase),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Admin</h1>
          <p className="text-sm text-slate-500">
            Gestão de utilizadores, cargos, departamentos e estado de contas.
          </p>
        </div>
        <InviteUserForm departments={departments} />
      </div>

      <AdminUserTable profiles={profiles} departments={departments} />
      <AdminDepartmentManager departments={departments} />
    </div>
  );
}
