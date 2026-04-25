"use client";

import { useState, useMemo } from "react";
import { busData, type JenisLayanan } from "@/lib/busData";

const akapCount = busData.filter((b) => b.jenis_layanan === "AKAP").length;
const akdpCount = busData.filter((b) => b.jenis_layanan === "AKDP").length;

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

export default function Home() {
  const [filter, setFilter] = useState<"ALL" | JenisLayanan>("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return busData.filter((b) => {
      if (filter !== "ALL" && b.jenis_layanan !== filter) return false;
      if (q && !b.nama_po.toLowerCase().includes(q) && !b.rute.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [filter, search]);

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
                Terminal Kutoarjo · Kab. Purworejo · April 2026
              </p>
            </div>
          </div>
          <div className="flex gap-2 text-xs shrink-0">
            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-full font-medium">
              AKAP
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-medium">
              AKDP
            </span>
          </div>
        </div>
      </header>

      {/* ── Stats Bar ── */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 py-4 flex gap-6">
          {[
            { label: "Total PO", value: busData.length, color: "text-slate-700" },
            { label: "AKAP", value: akapCount, color: "text-blue-600" },
            { label: "AKDP", value: akdpCount, color: "text-emerald-600" },
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
          {/* Segmented filter */}
          <div className="flex gap-1 bg-slate-200/70 p-1 rounded-xl w-fit">
            {(["ALL", "AKAP", "AKDP"] as const).map((v) => (
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

          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Cari nama PO atau rute…"
              value={search}
              onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value) setFilter("ALL");
            }}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition placeholder-slate-400"
            />
          </div>
        </div>

        {/* Result count */}
        <p className="text-xs text-slate-400 mb-4 font-medium tracking-wide uppercase">
          {filtered.length} hasil ditemukan
        </p>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide w-10">#</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Nama PO</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Rute</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">Jarak</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Layanan</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Tarif</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Jam Keberangkatan</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-slate-400 text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <SearchIcon />
                        <span>Tidak ada data yang sesuai</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((bus, i) => {
                    const isAkap = bus.jenis_layanan === "AKAP";
                    return (
                      <tr
                        key={i}
                        className="border-t border-slate-100 hover:bg-slate-50/80 transition-colors align-top group"
                      >
                        <td className="px-5 py-4 text-slate-300 text-xs">{i + 1}</td>
                        <td className="px-5 py-4">
                          <span className="font-semibold text-slate-800">{bus.nama_po}</span>
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
                          <div className="flex flex-wrap gap-1 max-w-sm">
                            {bus.jadwal.map((jam) => (
                              <span
                                key={jam}
                                className={`px-2 py-0.5 rounded-md text-xs font-mono border ${
                                  isAkap
                                    ? "bg-blue-50 text-blue-700 border-blue-100"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-100"
                                }`}
                              >
                                {jam}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
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
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
            <span>AKAP — Antar Kota Antar Provinsi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>AKDP — Antar Kota Dalam Provinsi</span>
          </div>
        </div>
      </main>

      <footer className="mt-6 pb-8 text-center text-xs text-slate-400">
        Data Terminal Kutoarjo · April 2026
      </footer>
    </div>
  );
}
