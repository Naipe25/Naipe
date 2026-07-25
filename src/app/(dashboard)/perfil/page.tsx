import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getCurrentProfile } from "@/services/profileService";
import { ProfileForm } from "@/components/ProfileForm";
import { PasswordForm } from "@/components/PasswordForm";

export default async function PerfilPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Perfil</h1>
        <p className="text-sm text-slate-500">{profile.email}</p>
      </div>
      <ProfileForm profile={profile} />
      <PasswordForm />
    </div>
  );
}
