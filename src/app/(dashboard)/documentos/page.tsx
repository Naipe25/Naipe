import { createClient } from "@/utils/supabase/server";
import { listDocuments } from "@/services/documentService";
import { listDepartments } from "@/services/departmentService";
import { getCurrentProfile } from "@/services/profileService";
import { DocumentUploadForm } from "@/components/DocumentUploadForm";
import { DocumentTable } from "@/components/DocumentTable";
import { FilterBar, FilterSelect } from "@/components/FilterBar";
import { DOCUMENT_CATEGORY_LABELS, GLOBAL_LABEL } from "@/lib/constants";
import type { DocumentCategory } from "@/types/database";

export default async function DocumentosPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string; category?: string }>;
}) {
  const { department, category } = await searchParams;
  const supabase = await createClient();

  const [departments, profile] = await Promise.all([
    listDepartments(supabase),
    getCurrentProfile(supabase),
  ]);

  const documents = await listDocuments(supabase, {
    departmentId: department === "global" ? null : department || undefined,
    category: (category as DocumentCategory) || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Documentos</h1>
          <p className="text-sm text-slate-500">
            Ficheiros e layouts organizados por departamento.
          </p>
        </div>
        <DocumentUploadForm departments={departments} />
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
          name="category"
          label="Categoria"
          defaultValue={category}
          options={[
            { value: "", label: "Todas" },
            ...Object.entries(DOCUMENT_CATEGORY_LABELS).map(([value, label]) => ({
              value,
              label,
            })),
          ]}
        />
      </FilterBar>

      <DocumentTable
        documents={documents}
        canDelete={(doc) =>
          profile?.role === "admin" || doc.uploaded_by === profile?.id
        }
      />
    </div>
  );
}
