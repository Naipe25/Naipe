"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, Plus, Trash2 } from "lucide-react";
import {
  addContactAction,
  deleteContactAction,
  deleteEntityAction,
} from "@/app/actions/contactActions";
import type { ContactEntityWithContacts } from "@/types/database";

export function ContactEntityCard({
  entity,
}: {
  entity: ContactEntityWithContacts;
}) {
  const router = useRouter();
  const [addingContact, setAddingContact] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleDeleteEntity() {
    if (!confirm(`Apagar "${entity.name}" e todos os contactos associados?`)) return;
    await deleteEntityAction(entity.id);
    router.refresh();
  }

  async function handleDeleteContact(id: string) {
    await deleteContactAction(id);
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{entity.name}</p>
          {entity.description && (
            <p className="text-xs text-slate-500">{entity.description}</p>
          )}
        </div>
        <button
          onClick={handleDeleteEntity}
          className="shrink-0 text-slate-400 hover:text-red-600"
          title="Apagar"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <ul className="mt-3 space-y-2">
        {entity.contacts.map((contact) => (
          <li
            key={contact.id}
            className="flex items-start justify-between gap-2 rounded-md bg-slate-50 p-2.5 text-sm"
          >
            <div className="min-w-0">
              <p className="font-medium text-slate-800">
                {contact.name}
                {contact.role && (
                  <span className="ml-1 font-normal text-slate-500">· {contact.role}</span>
                )}
              </p>
              <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-slate-500">
                {contact.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {contact.email}
                  </span>
                )}
                {contact.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {contact.phone}
                  </span>
                )}
              </div>
              {contact.notes && <p className="mt-1 text-xs text-slate-500">{contact.notes}</p>}
            </div>
            <button
              onClick={() => handleDeleteContact(contact.id)}
              className="shrink-0 text-slate-400 hover:text-red-600"
              title="Apagar contacto"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
        {entity.contacts.length === 0 && (
          <li className="text-xs text-slate-400">Sem contactos ainda.</li>
        )}
      </ul>

      {addingContact ? (
        <form
          ref={formRef}
          action={async (formData) => {
            await addContactAction(formData);
            formRef.current?.reset();
            setAddingContact(false);
          }}
          className="mt-3 space-y-2 border-t border-slate-100 pt-3"
        >
          <input type="hidden" name="entity_id" value={entity.id} />
          <div className="grid grid-cols-2 gap-2">
            <input
              name="name"
              placeholder="Nome"
              required
              className="rounded-md border border-slate-300 px-2 py-1.5 text-xs"
            />
            <input
              name="role"
              placeholder="Cargo"
              className="rounded-md border border-slate-300 px-2 py-1.5 text-xs"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="rounded-md border border-slate-300 px-2 py-1.5 text-xs"
            />
            <input
              name="phone"
              placeholder="Telefone"
              className="rounded-md border border-slate-300 px-2 py-1.5 text-xs"
            />
          </div>
          <textarea
            name="notes"
            placeholder="Notas"
            rows={2}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddingContact(false)}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-500"
            >
              Adicionar
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAddingContact(true)}
          className="mt-3 flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar contacto
        </button>
      )}
    </div>
  );
}
