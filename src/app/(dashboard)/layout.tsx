import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/utils/supabase/config";
import { getCurrentProfile } from "@/services/profileService";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">
            Supabase ainda não está configurado
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Preenche o <code>.env.local</code> (vê <code>.env.local.example</code> e o{" "}
            <code>README.md</code>) com os dados do teu projeto Supabase para poderes
            entrar e usar a app.
          </p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  if (!profile) {
    redirect("/login");
  }

  if (profile.account_state !== "active") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">
            Conta a aguardar ativação
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            A tua conta ({profile.email}) ainda não foi ativada por um admin da
            Naipe. Contacta a organização para ativarem o teu acesso.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar profile={profile} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
