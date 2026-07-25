import { format, isPast } from "date-fns";
import { pt } from "date-fns/locale";
import { createClient } from "@/utils/supabase/server";
import { listEvents } from "@/services/eventService";
import { listDepartments } from "@/services/departmentService";
import { getCurrentProfile } from "@/services/profileService";
import { EventFormModal } from "@/components/EventFormModal";
import { EventCard } from "@/components/EventCard";

export default async function TimelinePage() {
  const supabase = await createClient();

  const [events, departments, profile] = await Promise.all([
    listEvents(supabase),
    listDepartments(supabase),
    getCurrentProfile(supabase),
  ]);

  const canManage = profile?.role === "admin" || profile?.role === "coordenador";

  const groups = new Map<string, typeof events>();
  for (const event of events) {
    const key = format(new Date(event.start_date), "MMMM yyyy", { locale: pt });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(event);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Timeline</h1>
          <p className="text-sm text-slate-500">
            Lista cronológica de todos os eventos, passados e futuros.
          </p>
        </div>
        {canManage && <EventFormModal departments={departments} />}
      </div>

      {Array.from(groups.entries()).map(([month, monthEvents]) => (
        <div key={month}>
          <h2 className="mb-3 text-sm font-semibold capitalize uppercase tracking-wide text-slate-500">
            {month}
          </h2>
          <div className="space-y-3">
            {monthEvents.map((event) => (
              <div
                key={event.id}
                className={isPast(new Date(event.start_date)) ? "opacity-60" : ""}
              >
                <EventCard
                  event={event}
                  canDelete={canManage || event.created_by === profile?.id}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {events.length === 0 && (
        <p className="text-sm text-slate-500">Ainda não há eventos criados.</p>
      )}
    </div>
  );
}
