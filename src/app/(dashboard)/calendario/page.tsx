import Link from "next/link";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  addMonths,
  subMonths,
  parse,
} from "date-fns";
import { pt } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { listEvents } from "@/services/eventService";
import { listDepartments } from "@/services/departmentService";
import { getCurrentProfile } from "@/services/profileService";
import { EventFormModal } from "@/components/EventFormModal";

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const supabase = await createClient();

  const [events, departments, profile] = await Promise.all([
    listEvents(supabase),
    listDepartments(supabase),
    getCurrentProfile(supabase),
  ]);

  const referenceDate = month ? parse(month, "yyyy-MM", new Date()) : new Date();
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const canManage = profile?.role === "admin" || profile?.role === "coordenador";
  const prevMonth = format(subMonths(referenceDate, 1), "yyyy-MM");
  const nextMonth = format(addMonths(referenceDate, 1), "yyyy-MM");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Calendário</h1>
          <p className="text-sm text-slate-500">Vista mensal de todos os eventos.</p>
        </div>
        {canManage && <EventFormModal departments={departments} />}
      </div>

      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
        <Link
          href={`?month=${prevMonth}`}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <p className="text-sm font-semibold capitalize text-slate-900">
          {format(referenceDate, "MMMM yyyy", { locale: pt })}
        </p>
        <Link
          href={`?month=${nextMonth}`}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 shadow-sm">
        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
          <div key={d} className="bg-slate-50 px-2 py-1.5 text-center text-xs font-medium text-slate-500">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const dayEvents = events.filter((e) => isSameDay(new Date(e.start_date), day));
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[90px] bg-white p-1.5 ${
                isSameMonth(day, referenceDate) ? "" : "bg-slate-50 text-slate-400"
              }`}
            >
              <p className="text-xs font-medium">{format(day, "d")}</p>
              <div className="mt-1 space-y-1">
                {dayEvents.map((e) => (
                  <p
                    key={e.id}
                    title={e.title}
                    className="truncate rounded bg-indigo-100 px-1.5 py-0.5 text-[11px] text-indigo-800"
                  >
                    {e.title}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
