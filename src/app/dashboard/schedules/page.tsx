import Link from "next/link";
import { Pencil } from "lucide-react";

import { getDashboardSchedules } from "@/server/dashboardData";

export default function SchedulesPage() {
  const schedules = getDashboardSchedules();

  return (
    <main className="px-5 py-6 md:px-8">
      <PageHeader
        title="Jadwal"
        description="Lihat seluruh jam keberangkatan per layanan. Edit dilakukan dari data layanan terkait."
      />

      <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-emerald-900/60 dark:bg-[#0e1915]">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-emerald-950/70">
          <h3 className="text-lg font-bold tracking-tight text-[#06432f] dark:text-emerald-50">Daftar jam keberangkatan</h3>
          <p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">{schedules.length} jadwal aktif</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:bg-[#12231d] dark:text-slate-500">
                <th className="px-5 py-3">Jam</th>
                <th className="px-5 py-3">PO</th>
                <th className="px-5 py-3">Rute</th>
                <th className="px-5 py-3">Layanan</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="border-t border-slate-100 dark:border-emerald-950/70">
                  <td className="whitespace-nowrap px-5 py-3 font-mono font-semibold text-[#06432f] dark:text-emerald-50">
                    {schedule.departureTime}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 font-semibold text-slate-700 dark:text-slate-200">{schedule.operatorName}</td>
                  <td className="min-w-72 px-5 py-3 text-slate-500 dark:text-slate-400">{schedule.routeText}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">
                      {schedule.serviceTypeCode}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right">
                    <Link
                      href={`/dashboard/services/${schedule.serviceId}/edit`}
                      className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#12231d] dark:hover:text-emerald-200"
                    >
                      <Pencil size={13} />
                      Edit layanan
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight text-[#06432f] dark:text-emerald-50">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}
