"use client";

// Barra de filtros genérica baseada em query params (funciona sem JS; o auto-submit é progressive enhancement).
export function FilterBar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <form
      method="get"
      className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
    >
      {children}
      <noscript>
        <button
          type="submit"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600"
        >
          Filtrar
        </button>
      </noscript>
    </form>
  );
}

export function FilterSelect({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500">{label}</label>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
