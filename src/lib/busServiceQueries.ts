"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { apiGet } from "@/lib/api";
import type {
  BusServicesFilters,
  BusServicesResponse,
  SchedulePeriodDto,
} from "@/server/busServices";

export type SchedulePeriodsResponse = {
  data: SchedulePeriodDto[];
};

export const busServiceQueryKeys = {
  all: ["bus-services"] as const,
  list: (filters: BusServicesFilters = {}) =>
    [...busServiceQueryKeys.all, normalizeFilters(filters)] as const,
  periods: ["schedule-periods"] as const,
};

export function getBusServices(filters: BusServicesFilters = {}) {
  return apiGet<BusServicesResponse>("/bus-services", {
    params: normalizeFilters(filters),
  });
}

export function getSchedulePeriods() {
  return apiGet<SchedulePeriodsResponse>("/schedule-periods");
}

export function useBusServicesQuery(filters: BusServicesFilters = {}) {
  return useQuery({
    queryKey: busServiceQueryKeys.list(filters),
    queryFn: () => getBusServices(filters),
    placeholderData: keepPreviousData,
  });
}

export function useSchedulePeriodsQuery() {
  return useQuery({
    queryKey: busServiceQueryKeys.periods,
    queryFn: getSchedulePeriods,
  });
}

function normalizeFilters(filters: BusServicesFilters) {
  return {
    periodId: filters.periodId,
    serviceType: filters.serviceType,
    search: filters.search?.trim() || undefined,
  };
}
