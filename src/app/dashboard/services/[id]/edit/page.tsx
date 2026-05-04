import Link from "next/link";
import { notFound } from "next/navigation";

import { getBusServiceById } from "@/server/busServices";

import { EditServiceForm } from "../edit-form";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const serviceId = Number(id);

  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    notFound();
  }

  const service = getBusServiceById(serviceId);
  if (!service) notFound();

  return (
    <main className="px-5 py-6 md:px-8">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 dark:border-emerald-950/70 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Edit layanan
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#06432f] dark:text-emerald-50">
            {service.nama_po}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{service.rute}</p>
        </div>

        <Link
          href="/dashboard"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700 dark:border-emerald-900/60 dark:bg-[#0e1915] dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:text-emerald-300"
        >
          Kembali
        </Link>
      </div>

      <EditServiceForm service={service} />
    </main>
  );
}
