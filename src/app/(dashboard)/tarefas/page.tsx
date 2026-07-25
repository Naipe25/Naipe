import { createClient } from "@/utils/supabase/server";
import { listTasks } from "@/services/taskService";
import { listDepartments } from "@/services/departmentService";
import { listActiveProfiles } from "@/services/profileService";
import { TaskForm } from "@/components/TaskForm";
import { TaskItem } from "@/components/TaskItem";
import { FilterBar, FilterSelect } from "@/components/FilterBar";
import { GLOBAL_LABEL, TASK_STATUS_LABELS } from "@/lib/constants";
import type { TaskStatus } from "@/types/database";

export default async function TarefasPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string; status?: string }>;
}) {
  const { department, status } = await searchParams;
  const supabase = await createClient();

  const [departments, profiles] = await Promise.all([
    listDepartments(supabase),
    listActiveProfiles(supabase),
  ]);

  const tasks = await listTasks(supabase, {
    departmentId: department === "global" ? null : department || undefined,
    status: (status as TaskStatus) || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tarefas</h1>
          <p className="text-sm text-slate-500">
            Tarefas globais ou de um departamento específico.
          </p>
        </div>
        <TaskForm departments={departments} profiles={profiles} />
      </div>

      <FilterBar>
        <FilterSelect
          name="department"
          label="Departamento"
          defaultValue={department}
          options={[
            { value: "", label: "Todos" },
            { value: "global", label: GLOBAL_LABEL },
            ...departments.map((d) => ({ value: d.id, label: d.name })),
          ]}
        />
        <FilterSelect
          name="status"
          label="Estado"
          defaultValue={status}
          options={[
            { value: "", label: "Todos" },
            ...Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({
              value,
              label,
            })),
          ]}
        />
      </FilterBar>

      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <p className="text-sm text-slate-500">Sem tarefas para os filtros escolhidos.</p>
        )}
      </div>
    </div>
  );
}
