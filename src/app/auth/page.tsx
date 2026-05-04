import { redirect } from "next/navigation";

import { getOperatorSession } from "@/server/auth";

import { LoginForm } from "./login-form";

export default async function AuthPage() {
  const session = await getOperatorSession();
  if (session) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-[1fr_420px]">
        <section className="hidden border-r border-slate-200 bg-slate-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">
              Terminal Kutoarjo
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight">
              Dashboard operasional untuk mengelola jadwal bus.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300">
              Area ini khusus operator terminal untuk memperbarui PO, rute, tarif, dan jadwal keberangkatan.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 border-t border-white/10 pt-8 text-sm">
            <div>
              <p className="text-2xl font-semibold">17</p>
              <p className="mt-1 text-slate-400">Layanan</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">168</p>
              <p className="mt-1 text-slate-400">Jadwal</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">2</p>
              <p className="mt-1 text-slate-400">Kategori</p>
            </div>
          </div>
        </section>

        <section className="flex items-center px-5 py-10 sm:px-8 lg:px-10">
          <div className="w-full">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Akses operator
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                Masuk ke dashboard
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Gunakan kredensial operator terminal. Akses publik tetap berada di halaman jadwal utama.
              </p>
            </div>
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
