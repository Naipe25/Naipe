"use client";

import { useRouter } from "next/navigation";
import { Download, Trash2 } from "lucide-react";
import { deleteDocumentAction, getDocumentUrlAction } from "@/app/actions/documentActions";
import { DOCUMENT_CATEGORY_LABELS, GLOBAL_LABEL } from "@/lib/constants";
import type { AppDocument } from "@/types/database";

export function DocumentTable({
  documents,
  currentUserId,
  isAdmin,
}: {
  documents: AppDocument[];
  currentUserId: string | null;
  isAdmin: boolean;
}) {
  const router = useRouter();

  function canDelete(doc: AppDocument) {
    return isAdmin || doc.uploaded_by === currentUserId;
  }

  async function handleView(storagePath: string) {
    const url = await getDocumentUrlAction(storagePath);
    window.open(url, "_blank");
  }

  async function handleDelete(doc: AppDocument) {
    if (!confirm(`Apagar "${doc.name}"?`)) return;
    await deleteDocumentAction(doc.id, doc.storage_path);
    router.refresh();
  }

  if (documents.length === 0) {
    return <p className="text-sm text-slate-500">Sem documentos para os filtros escolhidos.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-2.5">Nome</th>
            <th className="px-4 py-2.5">Categoria</th>
            <th className="px-4 py-2.5">Departamento</th>
            <th className="px-4 py-2.5">Enviado por</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td className="px-4 py-2.5">
                <p className="font-medium text-slate-900">{doc.name}</p>
                {doc.description && (
                  <p className="text-xs text-slate-500">{doc.description}</p>
                )}
              </td>
              <td className="px-4 py-2.5 text-slate-600">
                {DOCUMENT_CATEGORY_LABELS[doc.category]}
              </td>
              <td className="px-4 py-2.5 text-slate-600">
                {doc.department?.name ?? GLOBAL_LABEL}
              </td>
              <td className="px-4 py-2.5 text-slate-600">
                {doc.uploader?.full_name ?? "—"}
              </td>
              <td className="px-4 py-2.5 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleView(doc.storage_path)}
                    title="Ver / Download"
                    className="text-slate-500 hover:text-indigo-600"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  {canDelete(doc) && (
                    <button
                      onClick={() => handleDelete(doc)}
                      title="Apagar"
                      className="text-slate-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
