"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Users,
  ListChecks,
  FileText,
  Calendar,
  History,
  Contact,
  ShieldCheck,
  UserCircle,
  LogOut,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ROLE_LABELS } from "@/lib/constants";
import type { ProfileWithDepartment } from "@/types/database";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_ITEMS = [
  { href: "/", label: "Início", icon: Home },
  { href: "/staff", label: "Staff", icon: Users },
  { href: "/tarefas", label: "Tarefas", icon: ListChecks },
  { href: "/documentos", label: "Documentos", icon: FileText },
  { href: "/calendario", label: "Calendário", icon: Calendar },
  { href: "/timeline", label: "Timeline", icon: History },
  { href: "/contactos", label: "Contactos", icon: Contact },
];

export function Sidebar({ profile }: { profile: ProfileWithDepartment }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/Logo_Trombone.svg"
            alt=""
            aria-hidden="true"
            width={36}
            height={36}
            className="shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-bold tracking-tight text-slate-900">Naipe</p>
            <p className="text-xs text-slate-500">Site interno</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        {profile.role === "admin" && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              pathname.startsWith("/admin")
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Admin
          </Link>
        )}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <Link
          href="/perfil"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: profile.avatar_color }}
          >
            {(profile.full_name ?? profile.email ?? "?").charAt(0).toUpperCase()}
          </span>
          <span className="flex-1 truncate">
            {profile.full_name ?? profile.email}
            <span className="block text-xs text-slate-400">
              {ROLE_LABELS[profile.role]}
              {profile.department ? ` · ${profile.department.name}` : ""}
            </span>
          </span>
          <UserCircle className="h-4 w-4 shrink-0" />
        </Link>
        <button
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
