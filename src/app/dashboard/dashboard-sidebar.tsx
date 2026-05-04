"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bus,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Moon,
  Route,
  Sun,
} from "lucide-react";

import { logoutAction } from "@/app/auth/actions";

const navigationGroups = [
  {
    label: "Operasional",
    compactLabel: "O",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Layanan bus", href: "/dashboard/services", icon: Bus },
      { label: "Jadwal", href: "/dashboard/schedules", icon: CalendarClock },
      { label: "Rute", href: "/dashboard/routes", icon: Route },
    ],
  },
];

const themeStorageKey = "bus-schedule-dashboard-theme";

function getInitialDashboardTheme() {
  if (typeof window === "undefined") return false;

  const storedTheme = window.localStorage.getItem(themeStorageKey);

  return (
    storedTheme === "dark" ||
    (!storedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
}

function applyDashboardTheme(enabled: boolean) {
  document.documentElement.classList.toggle("dark", enabled);
  document.documentElement.style.colorScheme = enabled ? "dark" : "light";
}

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(getInitialDashboardTheme);
  const pathname = usePathname();

  useEffect(() => {
    applyDashboardTheme(darkMode);
    window.localStorage.setItem(themeStorageKey, darkMode ? "dark" : "light");
  }, [darkMode]);

  function toggleDarkMode() {
    setDarkMode((value) => !value);
  }

  return (
    <aside
      className={`sticky top-0 hidden h-svh shrink-0 border-r border-slate-100 bg-[#fbfcfd] transition-[width] duration-200 dark:border-emerald-950/70 dark:bg-[#091410] lg:block ${
        collapsed ? "w-[86px]" : "w-[254px]"
      }`}
    >
      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        className="absolute -right-3 top-8 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-white text-[#06432f] shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 dark:border-emerald-900/70 dark:bg-[#0e1915] dark:text-emerald-100 dark:hover:border-emerald-700 dark:hover:text-emerald-300"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
      </button>

      <div className={`flex h-full flex-col ${collapsed ? "items-center px-4 py-8" : "px-7 py-8"}`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <Bus size={collapsed ? 26 : 22} strokeWidth={2.4} />
          </div>
          {!collapsed && (
            <div>
              <p className="text-lg font-bold tracking-tight text-[#06432f] dark:text-emerald-50">Kutoarjo</p>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Operator terminal</p>
            </div>
          )}
        </div>

        <nav className={`min-h-0 flex-1 overflow-y-auto ${collapsed ? "mt-10 w-full space-y-8" : "mt-10 space-y-8"}`}>
          {navigationGroups.map((group) => (
            <div key={group.label}>
              <p
                className={`text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 ${
                  collapsed ? "text-center" : "px-2"
                }`}
              >
                {collapsed ? group.compactLabel : group.label}
              </p>
              <div className="mt-3 space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === item.href
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center rounded-lg text-sm font-medium transition ${
                        collapsed ? "h-10 justify-center px-0" : "gap-3 px-3 py-2.5"
                      } ${
                        isActive
                          ? "bg-emerald-50 text-[#06432f] dark:bg-emerald-500/15 dark:text-emerald-100"
                          : "text-slate-500 hover:bg-white hover:text-[#06432f] dark:text-slate-400 dark:hover:bg-[#12231d] dark:hover:text-emerald-100"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={isActive ? "text-emerald-600 dark:text-emerald-300" : "text-slate-400 dark:text-slate-500"}
                      />
                      {!collapsed && item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {!collapsed && (
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-pressed={darkMode}
            className="mb-6 flex w-full items-center justify-between rounded-xl bg-white px-3 py-2.5 text-left text-sm text-slate-500 transition hover:text-[#06432f] dark:bg-[#0e1915] dark:text-slate-300 dark:hover:text-emerald-100"
          >
            <span className="flex items-center gap-2">
              {darkMode ? (
                <Sun size={17} className="text-amber-400" />
              ) : (
                <Moon size={17} className="text-slate-400 dark:text-slate-500" />
              )}
              Mode gelap
            </span>
            <span
              className={`h-5 w-9 rounded-full p-0.5 transition ${
                darkMode ? "bg-emerald-500" : "bg-slate-100 dark:bg-slate-800"
              }`}
            >
              <span
                className={`block h-4 w-4 rounded-full bg-white shadow-sm transition ${
                  darkMode ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </span>
          </button>
        )}

        <div
          className={`border-t border-slate-100 pt-6 dark:border-emerald-950/70 ${
            collapsed ? "flex w-full flex-col items-center gap-4" : "w-full"
          }`}
        >
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200">
              OP
            </div>
            {!collapsed && (
              <div>
                <p className="text-sm font-semibold text-[#06432f] dark:text-emerald-50">Operator</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Admin terminal</p>
              </div>
            )}
          </div>

          <form action={logoutAction} className={collapsed ? "" : "mt-4"}>
            <button
              type="submit"
              title={collapsed ? "Keluar" : undefined}
              className={`flex items-center rounded-lg text-sm font-medium text-slate-500 transition hover:bg-white hover:text-red-600 dark:text-slate-400 dark:hover:bg-[#12231d] dark:hover:text-red-400 ${
                collapsed ? "h-10 w-10 justify-center" : "gap-2 px-2 py-2"
              }`}
            >
              <LogOut size={17} />
              {!collapsed && "Keluar"}
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
