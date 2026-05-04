import Link from "next/link";

import { getBusServices } from "@/server/busServices";
import {
  CalendarPlus,
  Route,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const result = getBusServices();
  const services = result?.data ?? [];
  const stats = result?.meta.stats ?? { all: 0, AKAP: 0, AKDP: 0 };
  const period = result?.meta.period;
  const totalTrips = services.reduce((total, service) => total + service.jadwal.length, 0);
  const routeGroups = services.reduce<Record<string, { route: string; count: number; trips: number }>>(
    (groups, service) => {
      const current = groups[service.rute] ?? { route: service.rute, count: 0, trips: 0 };
      current.count += 1;
      current.trips += service.jadwal.length;
      groups[service.rute] = current;
      return groups;
    },
    {},
  );
  const routeStats = Object.values(routeGroups).sort((a, b) => b.trips - a.trips).slice(0, 6);
  const topServices = services
    .slice()
    .sort((a, b) => b.jadwal.length - a.jadwal.length)
    .slice(0, 6);

  return (
    <main className="px-5 py-6 md:px-8">
      <div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#06432f] dark:text-emerald-50">Dashboard</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Data {period?.terminal.name ?? "Terminal Kutoarjo"} untuk {period?.name ?? "periode aktif"}.
          </p>
        </div>
      </div>

      <section className="grid gap-4 py-7 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total layanan", value: stats.all, helper: "PO dan rute aktif", icon: Route },
          { label: "Total jadwal", value: totalTrips, helper: "Jam unik tersedia", icon: CalendarPlus },
          { label: "AKAP", value: stats.AKAP, helper: "Antar provinsi", icon: TrendingUp },
          { label: "AKDP", value: stats.AKDP, helper: "Dalam provinsi", icon: TrendingUp },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-slate-200 bg-white px-5 py-4 dark:border-emerald-900/60 dark:bg-[#0e1915]"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {item.label}
              </p>
              <item.icon size={17} className="text-emerald-600 dark:text-emerald-300" />
            </div>
            <div className="mt-3 flex items-end gap-2">
              <p className="text-3xl font-bold tracking-tight text-[#06432f] dark:text-emerald-50">{item.value}</p>
              <p className="pb-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">aktif</p>
            </div>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{item.helper}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-emerald-900/60 dark:bg-[#0e1915]">
          <h3 className="text-xl font-bold tracking-tight text-[#06432f] dark:text-emerald-50">Rute tersibuk</h3>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Urutan berdasarkan jumlah trip aktif.</p>
          <div className="mt-5 space-y-4">
            {routeStats.map((route, index) => (
              <div key={route.route}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#06432f] dark:text-emerald-50">{route.route}</p>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{route.count} layanan</p>
                  </div>
                  <p className="shrink-0 text-xs font-bold text-emerald-600 dark:text-emerald-300">{route.trips} trip</p>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-1.5 rounded-full bg-emerald-500"
                    style={{ width: `${Math.max(8, 100 - index * 13)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-emerald-900/60 dark:bg-[#0e1915]">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight text-[#06432f] dark:text-emerald-50">Layanan terbanyak trip</h3>
            <Link
              href="/dashboard/services"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200"
            >
              Lihat semua
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {topServices.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-emerald-950/70"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#06432f] dark:text-emerald-50">{service.nama_po}</p>
                  <p className="mt-1 truncate text-xs text-slate-400 dark:text-slate-500">{service.rute}</p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  {service.jadwal.length} trip
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
