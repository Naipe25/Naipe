import { createClient } from "@/utils/supabase/server";
import { listContactEntities } from "@/services/contactService";
import { ContactEntityCard } from "@/components/ContactEntityCard";
import { NewEntityForm } from "@/components/NewEntityForm";

export default async function ContactosPage() {
  const supabase = await createClient();
  const entities = await listContactEntities(supabase);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Contactos</h1>
          <p className="text-sm text-slate-500">
            Oradores, patrocinadores, parceiros e outras entidades externas.
          </p>
        </div>
        <NewEntityForm />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {entities.map((entity) => (
          <ContactEntityCard key={entity.id} entity={entity} />
        ))}
      </div>

      {entities.length === 0 && (
        <p className="text-sm text-slate-500">Ainda não há entidades registadas.</p>
      )}
    </div>
  );
}
