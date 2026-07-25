"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { MapPin, Trash2 } from "lucide-react";
import { deleteEventAction } from "@/app/actions/eventActions";
import { GLOBAL_LABEL } from "@/lib/constants";
import type { AppEvent } from "@/types/database";

export function EventCard({
  event,
  canDelete,
}: {
  event: AppEvent;
  canDelete: boolean;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Apagar o evento "${event.title}"?`)) return;
    await deleteEventAction(event.id);
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{event.title}</p>
          <p className="text-xs text-slate-500">
            {format(new Date(event.start_date), "d MMM yyyy, HH:mm", { locale: pt })}
            {event.end_date &&
              ` – ${format(new Date(event.end_date), "d MMM yyyy, HH:mm", { locale: pt })}`}
          </p>
          {event.location && (
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3 w-3" />
              {event.location}
            </p>
          )}
          {event.description && (
            <p className="mt-1 text-sm text-slate-600">{event.description}</p>
          )}
          <p className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {event.department?.name ?? GLOBAL_LABEL}
          </p>
        </div>
        {canDelete && (
          <button
            onClick={handleDelete}
            className="shrink-0 text-slate-400 hover:text-red-600"
            title="Apagar evento"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
