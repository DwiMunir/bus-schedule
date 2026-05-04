"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { BusServiceDto } from "@/server/busServices";

import {
  updateBusServiceAction,
  type EditServiceActionState,
} from "./actions";

const initialState: EditServiceActionState = {};

export function EditServiceForm({ service }: { service: BusServiceDto }) {
  const [state, action, pending] = useActionState(updateBusServiceAction, initialState);

  return (
    <form action={action} className="mt-6 space-y-6">
      <input type="hidden" name="serviceId" value={service.id} />

      <section className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 dark:border-emerald-900/60 dark:bg-[#0e1915] lg:grid-cols-2">
        <Field label="Nama PO" error={state?.errors?.operatorName?.[0]}>
          <input
            name="operatorName"
            defaultValue={service.nama_po}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-900/70 dark:bg-[#0b1512] dark:text-emerald-50 dark:focus:border-emerald-500"
          />
        </Field>

        <Field label="Jenis layanan" error={state?.errors?.serviceTypeCode?.[0]}>
          <select
            name="serviceTypeCode"
            defaultValue={service.jenis_layanan}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-900/70 dark:bg-[#0b1512] dark:text-emerald-50 dark:focus:border-emerald-500"
          >
            <option value="AKAP">AKAP</option>
            <option value="AKDP">AKDP</option>
          </select>
        </Field>

        <Field label="Rute" error={state?.errors?.routeText?.[0]}>
          <input
            name="routeText"
            defaultValue={service.rute}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-900/70 dark:bg-[#0b1512] dark:text-emerald-50 dark:focus:border-emerald-500"
          />
        </Field>

        <Field label="Jarak" error={state?.errors?.distanceText?.[0]}>
          <input
            name="distanceText"
            defaultValue={service.jarak}
            placeholder="565 km"
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-900/70 dark:bg-[#0b1512] dark:text-emerald-50 dark:focus:border-emerald-500"
          />
        </Field>

        <Field label="Tarif" error={state?.errors?.fareText?.[0]}>
          <input
            name="fareText"
            defaultValue={service.tarif}
            placeholder="Rp 150.000 - Rp 250.000"
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-900/70 dark:bg-[#0b1512] dark:text-emerald-50 dark:focus:border-emerald-500"
          />
        </Field>

        <Field label="Jadwal keberangkatan" error={state?.errors?.schedulesText?.[0]}>
          <textarea
            name="schedulesText"
            defaultValue={service.jadwal.join("\n")}
            rows={8}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-900/70 dark:bg-[#0b1512] dark:text-emerald-50 dark:focus:border-emerald-500"
          />
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            Pisahkan jam dengan baris baru, koma, spasi, atau titik koma. Format jam: HH:MM.
          </p>
        </Field>
      </section>

      {state?.message && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {state.message}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Link
          href="/dashboard"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 dark:border-emerald-900/60 dark:bg-[#0e1915] dark:text-slate-300 dark:hover:border-emerald-700"
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#06432f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#053625] disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
        >
          {pending ? "Menyimpan..." : "Simpan perubahan"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</span>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
    </label>
  );
}
