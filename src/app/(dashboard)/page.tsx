import { createClient } from "@/utils/supabase/server";
import { getCurrentProfile } from "@/services/profileService";
import { getOrgPage } from "@/services/orgService";
import { OrgPageEditor } from "./OrgPageEditor";

export default async function HomePage() {
  const supabase = await createClient();
  const [profile, orgPage] = await Promise.all([
    getCurrentProfile(supabase),
    getOrgPage(supabase),
  ]);

  return (
    <div className="space-y-6">
      <OrgPageEditor
        title={orgPage?.title ?? "Sobre a Naipe"}
        body={orgPage?.body ?? ""}
        canEdit={profile?.role === "admin"}
      />
    </div>
  );
}
