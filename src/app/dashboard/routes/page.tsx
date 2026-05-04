import { getDashboardRoutes } from "@/server/dashboardData";

export default function RoutesPage() {
  const routes = getDashboardRoutes();

  return (
    <main className="px-5 py-6 md:px-8">
      <PageHeader
        title="Rute"
        description="Master rute yang dipakai layanan bus, termasuk asal, tujuan, dan estimasi jarak."
      />

      <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-emerald-900/60 dark:bg-[#0e1915]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:bg-[#12231d] dark:text-slate-500">
              <th className="px-5 py-3">Rute</th>
              <th className="px-5 py-3">Asal</th>
              <th className="px-5 py-3">Tujuan</th>
              <th className="px-5 py-3">Jarak</th>
              <th className="px-5 py-3">Layanan</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={route.id} className="border-t border-slate-100 dark:border-emerald-950/70">
                <td className="min-w-72 px-5 py-3 font-semibold text-[#06432f] dark:text-emerald-50">{route.routeText}</td>
                <td className="whitespace-nowrap px-5 py-3 text-slate-500 dark:text-slate-400">{route.originName ?? "-"}</td>
                <td className="whitespace-nowrap px-5 py-3 text-slate-500 dark:text-slate-400">{route.destinationName ?? "-"}</td>
                <td className="whitespace-nowrap px-5 py-3 text-slate-500 dark:text-slate-400">
                  {route.distanceText ?? `${route.distanceKm ?? "-"} km`}
                </td>
                <td className="whitespace-nowrap px-5 py-3">
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    {route.services} layanan
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
