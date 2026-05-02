"use client";

import { Fragment, useDeferredValue } from "react";

import { useBusServicesQuery } from "@/lib/busServiceQueries";
import { useBusScheduleStore, type BusScheduleFilter } from "@/lib/busScheduleStore";

function SearchIcon() {
  return (
    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    </svg>
  );
}

function BusIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M8 6v6M16 6v6M3 10h18M5 6h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm2 10v1a1 1 0 0 0 2 0v-1m6 0v1a1 1 0 0 0 2 0v-1" />
    </svg>
  );
}

function RouteIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180 text-slate-600" : "text-slate-300"}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={`w-3.5 h-3.5 shrink-0 ${className ?? ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
    </svg>
  );
}

const PREVIEW_COUNT = 3;

export default function Home() {
  const filter = useBusScheduleStore((state) => state.filter);
  const search = useBusScheduleStore((state) => state.search);
  const expandedServiceIds = useBusScheduleStore((state) => state.expandedServiceIds);
  const setFilter = useBusScheduleStore((state) => state.setFilter);
  const setSearch = useBusScheduleStore((state) => state.setSearch);
  const toggleService = useBusScheduleStore((state) => state.toggleService);
  const deferredSearch = useDeferredValue(search);
  const serviceType = filter === "ALL" ? undefined : filter;
  const busServicesQuery = useBusServicesQuery({
    serviceType,
    search: deferredSearch,
  });
  const buses = busServicesQuery.data?.data ?? [];
  const stats = busServicesQuery.data?.meta.stats ?? { all: 0, AKAP: 0, AKDP: 0 };
  const period = busServicesQuery.data?.meta.period;
  const terminalLabel = period
    ? `${period.terminal.name} · ${period.terminal.regency ?? "Kab. Purworejo"} · ${period.name}`
    : "Terminal Kutoarjo · Kab. Purworejo · April 2026";

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── Header ── */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-5 py-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center ring-1 ring-white/20">
              <BusIcon />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight leading-none">
                Informasi Keberangkatan Bus
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                {terminalLabel}
              </p>
            </div>
          </div>
          <div className="flex gap-2 text-xs shrink-0">
            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-full font-medium">AKAP</span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-medium">AKDP</span>
          </div>
        </div>
      </header>

      {/* ── Stats Bar ── */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 py-4 flex gap-6">
          {[
            { label: "Total PO", value: stats.all, color: "text-slate-700" },
            { label: "AKAP", value: stats.AKAP, color: "text-blue-600" },
            { label: "AKDP", value: stats.AKDP, color: "text-emerald-600" },
          ].map((s) => (
            <div key={s.label} className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
              <span className="text-xs text-slate-500 font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main ── */}
      <main className="max-w-6xl mx-auto px-5 py-7">

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex gap-1 bg-slate-200/70 p-1 rounded-xl w-fit">
            {(["ALL", "AKAP", "AKDP"] as const satisfies readonly BusScheduleFilter[]).map((v) => (
              <button
                key={v}
                onClick={() => setFilter(v)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  filter === v
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {v === "ALL" ? "Semua" : v}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Cari nama PO atau rute…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition placeholder-slate-400"
            />
          </div>
        </div>

        {/* Result count */}
        <p className="text-xs text-slate-400 mb-4 font-medium tracking-wide uppercase">
          {busServicesQuery.isLoading
            ? "Memuat data dari database..."
            : `${buses.length} hasil · klik baris untuk lihat jadwal lengkap`}
        </p>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide w-10">#</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Nama PO</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Rute</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">Jarak</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Layanan</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Tarif</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Jadwal</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {busServicesQuery.isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-slate-400 text-sm">
                      Memuat jadwal bus...
                    </td>
                  </tr>
                ) : busServicesQuery.isError ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-red-500 text-sm">
                      {busServicesQuery.error instanceof Error
                        ? busServicesQuery.error.message
                        : "Gagal memuat data jadwal"}
                    </td>
                  </tr>
                ) : buses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-slate-400 text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <SearchIcon />
                        <span>Tidak ada data yang sesuai</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  buses.map((bus, i) => {
                    const isAkap = bus.jenis_layanan === "AKAP";
                    const isOpen = expandedServiceIds.has(bus.id);
                    const accentBar = isAkap ? "bg-blue-500" : "bg-emerald-500";
                    const chipBase = isAkap
                      ? "bg-blue-50 text-blue-700 border-blue-100"
                      : "bg-emerald-50 text-emerald-700 border-emerald-100";
                    const accentText = isAkap ? "text-blue-600" : "text-emerald-600";
                    const expandBg = isAkap ? "bg-blue-50/50" : "bg-emerald-50/50";
                    const previewJadwal = bus.jadwal.slice(0, PREVIEW_COUNT);
                    const remainingCount = bus.jadwal.length - PREVIEW_COUNT;

                    return (
                      <Fragment key={bus.id}>
                        {/* ── Main row ── */}
                        <tr
                          onClick={() => toggleService(bus.id)}
                          className={`border-t border-slate-100 cursor-pointer select-none transition-colors ${
                            isOpen ? (isAkap ? "bg-blue-50/30" : "bg-emerald-50/30") : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="px-5 py-4 text-slate-300 text-xs">{i + 1}</td>
                          <td className="px-5 py-4 font-semibold text-slate-800 whitespace-nowrap">
                            {bus.nama_po}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-start gap-1.5 text-slate-600">
                              <RouteIcon />
                              <span className="leading-snug">{bus.rute}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-500 whitespace-nowrap text-xs font-medium">
                            {bus.jarak}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              isAkap
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}>
                              {bus.jenis_layanan}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-xs">
                            {bus.tarif}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {previewJadwal.map((jam) => (
                                <span key={jam} className={`px-2 py-0.5 rounded text-xs font-mono border ${chipBase}`}>
                                  {jam}
                                </span>
                              ))}
                              {remainingCount > 0 && (
                                <span className={`text-xs font-medium ${accentText}`}>
                                  +{remainingCount}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="pr-5 py-4 text-right">
                            <ChevronIcon open={isOpen} />
                          </td>
                        </tr>

                        {/* ── Expanded panel ── */}
                        {isOpen && (
                          <tr className="border-t border-slate-100">
                            <td colSpan={8} className="p-0">
                              <div className={`relative ${expandBg}`}>
                                {/* Left accent bar */}
                                <div className={`absolute left-0 top-0 bottom-0 w-0.75 ${accentBar}`} />

                                <div className="px-5 py-4 pl-8">
                                  {/* Panel header */}
                                  <div className="flex items-center gap-2 mb-3">
                                    <ClockIcon className={accentText} />
                                    <span className={`text-xs font-semibold ${accentText}`}>
                                      Jadwal Keberangkatan
                                    </span>
                                    <span className="bg-white border border-slate-200 text-slate-500 text-xs px-1.5 py-0.5 rounded font-semibold">
                                      {bus.jadwal.length}× trip
                                    </span>
                                  </div>

                                  {/* All chips */}
                                  <div className="flex flex-wrap gap-1.5">
                                    {bus.jadwal.map((jam) => (
                                      <span
                                        key={jam}
                                        className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold border shadow-sm bg-white ${
                                          isAkap ? "text-blue-700 border-blue-200" : "text-emerald-700 border-emerald-200"
                                        }`}
                                      >
                                        {jam}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-5 flex flex-wrap gap-5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            <span>AKAP — Antar Kota Antar Provinsi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>AKDP — Antar Kota Dalam Provinsi</span>
          </div>
        </div>
      </main>

      <footer className="mt-6 pb-8 text-center text-xs text-slate-400">
        Data {period?.terminal.name ?? "Terminal Kutoarjo"} · {period?.name ?? "April 2026"}
      </footer>
    </div>
  );
}
