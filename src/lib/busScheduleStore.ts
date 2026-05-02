"use client";

import { create } from "zustand";

import type { ServiceTypeFilter } from "@/server/busServices";

export type BusScheduleFilter = "ALL" | ServiceTypeFilter;

type BusScheduleState = {
  filter: BusScheduleFilter;
  search: string;
  expandedServiceIds: Set<number>;
  setFilter: (filter: BusScheduleFilter) => void;
  setSearch: (search: string) => void;
  toggleService: (serviceId: number) => void;
};

export const useBusScheduleStore = create<BusScheduleState>((set) => ({
  filter: "ALL",
  search: "",
  expandedServiceIds: new Set<number>(),
  setFilter: (filter) =>
    set({
      filter,
      expandedServiceIds: new Set<number>(),
    }),
  setSearch: (search) =>
    set({
      search,
      expandedServiceIds: new Set<number>(),
    }),
  toggleService: (serviceId) =>
    set((state) => {
      const expandedServiceIds = new Set(state.expandedServiceIds);

      if (expandedServiceIds.has(serviceId)) {
        expandedServiceIds.delete(serviceId);
      } else {
        expandedServiceIds.add(serviceId);
      }

      return { expandedServiceIds };
    }),
}));
