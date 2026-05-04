import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Plus } from "lucide-react";

import { getOperatorSession } from "@/server/auth";

import { DashboardSidebar } from "./dashboard-sidebar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getOperatorSession();
  if (!session) redirect("/auth");

  return (
    <div className="dashboard-theme min-h-screen bg-[#f2f1f6] text-[#063f2e] dark:bg-[#07120f] dark:text-emerald-50">
      <div className="mx-auto flex min-h-screen max-w-full bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)] dark:bg-[#0b1512] dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
        <DashboardSidebar />

        <div className="min-w-0 flex-1 bg-white dark:bg-[#0b1512]">
          <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 backdrop-blur dark:border-emerald-950/70 dark:bg-[#0b1512]/95">
            <div className="flex items-center justify-between gap-4 px-5 py-5 md:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Dashboard operator
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#06432f] dark:text-emerald-50">
                  Terminal Kutoarjo
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-500 transition hover:border-emerald-200 hover:text-emerald-700 dark:border-emerald-900/60 dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:text-emerald-300"
                >
                  Lihat publik
                </Link>
                <button
                  type="button"
                  className="!hidden items-center gap-2 rounded-lg bg-[#06432f] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#053625] dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400 sm:flex"
                >
                  <Plus size={17} />
                  Tambah data
                </button>
              </div>
            </div>
          </header>

          {children}
        </div>
      </div>
    </div>
  );
}
